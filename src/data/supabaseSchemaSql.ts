export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- BIORYTMO HEALTH OS - SCHEMA COMPLETO PARA SUPABASE (POSTGRESQL 15+)
-- Versão 2.0: Onboarding Wizard + Medicamentos Contínuos/Temporários + Estoque + Wearables
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMs do Sistema
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE activity_level_type AS ENUM ('sedentary', 'light', 'moderate', 'intense', 'athlete');
CREATE TYPE condition_type_category AS ('physical_gut', 'mental', 'chronic', 'intolerance');
CREATE TYPE medication_treatment_type AS ENUM ('continuous', 'temporary');
CREATE TYPE continuous_frequency_type AS ENUM ('daily', 'alternate_days', 'specific_weekdays');
CREATE TYPE stock_movement_type AS ENUM ('dose_intake', 'refill_purchase', 'inventory_adjustment', 'waste');
CREATE TYPE lab_status_type AS ENUM ('up_to_date', 'due_soon', 'overdue', 'urgent');

-- ==============================================================================
-- 3. TABELA: profiles (Usuários & Estado de Onboarding)
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nickname TEXT,
    birth_date DATE,
    gender gender_type,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    activity_level activity_level_type DEFAULT 'sedentary',
    target_sleep_hours NUMERIC(3,1) DEFAULT 8.0,
    wake_time TIME DEFAULT '06:30:00',
    bed_time TIME DEFAULT '22:30:00',
    baseline_resting_hr INTEGER DEFAULT 65,
    onboarding_completed BOOLEAN DEFAULT FALSE, -- Redirecionamento obrigatório no 1º login
    onboarding_step INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 4. TABELA: condicoes_saude_usuario (Passos 2, 3 e 4 do Onboarding)
-- ==============================================================================
CREATE TABLE public.condicoes_saude_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category condition_type_category NOT NULL, -- 'physical_gut', 'mental', 'chronic', 'intolerance'
    condition_name TEXT NOT NULL, -- ex: 'Gastrite', 'Ansiedade', 'Colesterol Alto', 'Intolerância à Lactose'
    severity TEXT DEFAULT 'moderate', -- 'mild', 'moderate', 'severe'
    notes TEXT,
    diagnosed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, condition_name)
);

-- ==============================================================================
-- 5. TABELA: medicamentos_usuario (Passo 5: Gestão Completa de Estoque & Posologia)
-- ==============================================================================
CREATE TABLE public.medicamentos_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: 'Amoxicilina 500mg' ou 'Fitoesteróis Livres'
    dosage TEXT NOT NULL, -- ex: '1 cápsula', '50mg', '20 gotas'
    type medication_treatment_type NOT NULL, -- 'continuous' ou 'temporary'
    
    -- Configuração de Uso Contínuo
    continuous_frequency continuous_frequency_type DEFAULT 'daily',
    specific_days INTEGER[], -- Array com dias da semana [0, 2, 4] (0=Domingo, 1=Segunda...)
    
    -- Configuração de Uso Temporário (Tratamentos Agudos)
    interval_hours INTEGER, -- ex: 8 (de 8 em 8 horas)
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- Data final calculada ou inserida pelo médico
    
    -- Horários do dia de ingestão
    scheduled_times TIME[] NOT NULL, -- ex: ['08:00:00', '16:00:00', '00:00:00']
    
    -- Gestão de Estoque
    current_stock NUMERIC(8,2) NOT NULL DEFAULT 0,
    min_stock_alert_days INTEGER DEFAULT 5, -- Alerta compra com 5 dias de antecedência
    unit TEXT DEFAULT 'comprimidos', -- 'comprimidos', 'cápsulas', 'gotas', 'sachês'
    instructions TEXT, -- 'Tomar após o almoço', 'Em jejum com água morna'
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 6. TABELA: registros_estoque_medicamentos (Histórico de Consumo & Reposições)
-- ==============================================================================
CREATE TABLE public.registros_estoque_medicamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medicamento_id UUID NOT NULL REFERENCES public.medicamentos_usuario(id) ON DELETE CASCADE,
    movement_type stock_movement_type NOT NULL, -- 'dose_intake' ('Já tomei'), 'refill_purchase', etc.
    quantity_changed NUMERIC(6,2) NOT NULL, -- negativo para consumo (-1), positivo para compra (+30)
    stock_after NUMERIC(8,2) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 7. TABELA: dados_wearables (Passo 6: Samsung Galaxy Fit 3 & Health Connect)
-- ==============================================================================
CREATE TABLE public.dados_wearables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    device_model TEXT DEFAULT 'Samsung Galaxy Fit 3',
    source_type TEXT DEFAULT 'samsung_health_connect',
    
    -- Métricas Biométricas
    sleep_score INTEGER CHECK (sleep_score >= 0 AND sleep_score <= 100),
    total_sleep_minutes INTEGER,
    deep_sleep_minutes INTEGER,
    rem_sleep_minutes INTEGER,
    resting_heart_rate INTEGER,
    stress_level INTEGER, -- 0 a 100
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    blood_glucose_mg_dl NUMERIC(6,2),
    steps_count INTEGER DEFAULT 0,
    is_manual_entry BOOLEAN DEFAULT FALSE, -- Permite inserção/edição manual no app
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, log_date)
);

-- ==============================================================================
-- 8. TABELA: exames_usuario (Passo 7: Upload de Exames e Arquivos)
-- ==============================================================================
CREATE TABLE public.exames_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- ex: 'Perfil Lipídico e Glicemia em Jejum'
    exam_date DATE NOT NULL,
    file_url TEXT NOT NULL, -- Link para o Supabase Storage bucket 'medical-records'
    file_type TEXT NOT NULL, -- 'pdf', 'image/jpeg', 'image/png'
    file_size_bytes BIGINT,
    parsed_markers JSONB DEFAULT '{}'::jsonb, -- ex: { "colesterol_total": 400, "ldl": 245 }
    doctor_lab_name TEXT,
    next_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 9. TABELA: metas_usuario (Passo 8: Objetivos Primários de Saúde)
-- ==============================================================================
CREATE TABLE public.metas_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_key TEXT NOT NULL, -- 'cholesterol_control', 'weight_loss', 'gut_health', 'sleep_optimization'
    goal_title TEXT NOT NULL,
    target_value NUMERIC(10,2),
    target_unit TEXT,
    deadline DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 10. POLÍTICAS DE SEGURANÇA (RLS - ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condicoes_saude_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicamentos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_estoque_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_wearables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa seu próprio perfil" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuário acessa suas condições" ON public.condicoes_saude_usuario FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário acessa seus medicamentos" ON public.medicamentos_usuario FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário acessa estoque" ON public.registros_estoque_medicamentos FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário acessa biometria" ON public.dados_wearables FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário acessa exames" ON public.exames_usuario FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário acessa metas" ON public.metas_usuario FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ==============================================================================
-- 11. TRIGGER: Atualização Automática de Estoque após Confirmação 'Já Tomei'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_medication_intake()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'dose_intake' THEN
        UPDATE public.medicamentos_usuario
        SET current_stock = GREATEST(0, current_stock - 1),
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.medicamento_id;
    ELSIF NEW.movement_type = 'refill_purchase' THEN
        UPDATE public.medicamentos_usuario
        SET current_stock = current_stock + NEW.quantity_changed,
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.medicamento_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medication_stock
AFTER INSERT ON public.registros_estoque_medicamentos
FOR EACH ROW EXECUTE FUNCTION public.handle_medication_intake();
`;
