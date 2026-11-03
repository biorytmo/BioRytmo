import { PathologyKnowledge } from '../types/health';

export const PATHOLOGY_KNOWLEDGE_BASE: PathologyKnowledge[] = [
  {
    id: 'cholesterol_severe',
    name: 'Hipercolesterolemia Severa (Colesterol Total > 300-400 mg/dL)',
    category: 'cardiovascular',
    description: 'Elevação acentuada de lipoproteínas aterogênicas circulantes (LDL-c e ApoB), por redução de clearance hepático ou hiperprodução endógena.',
    rootCauses: [
      'Downregulation ou polimorfismo genético em receptores hepáticos de LDL (LDLR / PCSK9)',
      'Consumo crônico de ácidos graxos saturados hiper-aterogênicos (palmítico e mirístico) com carboidratos refinados',
      'Resistência à insulina e sobrecarga hepática (esteatose não alcoólica)',
      'Hipotireoidismo subclínico ou inflamação sistêmica endotelial'
    ],
    whatHarms: {
      foods: [
        'Gorduras trans industriais e óleos vegetais pró-inflamatórios oxidados em alta temperatura',
        'Carnes ultraprocessadas ricas em compostos nitrosos e sódio elevado',
        'Açúcar refinado e xarope de frutose (indutores potentes de lipogênese de novo hepática e ApoB)',
        'Frituras por imersão e lácteos integrais de alta densidade se consumidos em excesso'
      ],
      habits: [
        'Sedentarismo (reduz atividade da lipase lipoproteica e HDL-c funcional)',
        'Privação crônica de sono (desregula SREBP-1c e síntese noturna de colesterol)',
        'Tabagismo e estresse contínuo com cortisol elevado matinal'
      ],
      mechanisms: [
        'Oxidação de partículas pequenas e densas de LDL (sdLDL) na túnica íntima endotelial',
        'Inibição de clearance mediada por ativação de PCSK9'
      ]
    },
    whatHelps: {
      foods: [
        'Fibras solúveis viscosas (farelo de aveia / beta-glucana, psyllium, sementes de chia)',
        'Alimentos ricos em fitoesteróis naturais (abacate hass, sementes de abóbora, azeite EV extravirgem cru)',
        'Polifenóis e antocianinas (frutas vermelhas, romã, cacau 85%+ sem açúcar)',
        'Peixes de águas profundas ricos em EPA/DHA (sardinha, cavalinha, salmão selvagem)',
        'Leguminosas (lentilhas, grão de bico) como ligantes de sais biliares'
      ],
      habits: [
        'Exercício aeróbio contínuo e fracionado para biogênese mitocondrial e captação periférica',
        'Jejum noturno fisiológico de 12 horas para permitir autofagia lipídica',
        'Hidratação matinal com eletrólitos para circulação periférica'
      ],
      functionalCompounds: [
        'Beta-glucanas (quelam ácidos biliares forçando o fígado a consumir colesterol)',
        'Monacolina K de levedura vermelha (inibição HMG-CoA redutase natural bioidêntica)',
        'Berberina fitossomada (estabilização do receptor LDL e inibição de PCSK9)',
        'Policosanol e Fitoesteróis livres (competição na absorção micelar de colesterol intestinal)'
      ]
    },
    naturalSupplements: [
      {
        compound: 'Fitoesteróis Livres Padronizados',
        dosage: '2.000 mg ao dia',
        evidenceGrade: 'A',
        timing: 'Dividido em 2 doses (1.000mg antes do almoço e 1.000mg antes do jantar)',
        biologicalMechanism: 'Compete diretamente com o colesterol no lúmen intestinal pela incorporação em micelas mistas via transportador NPC1L1, reduzindo a absorção intestinal em até 40%.',
        safetyWarnings: ['Pode reduzir discretamente absorção de betacaroteno; complementar com dieta colorida.']
      },
      {
        compound: 'Berberina HCl / Fitossomada',
        dosage: '500 mg 2x ao dia',
        evidenceGrade: 'A',
        timing: '15 minutos antes das refeições principais',
        biologicalMechanism: 'Promove a regulação positiva dos receptores de LDL (LDLR) no fígado através da estabilização do mRNA do LDLR via via ERK, além de inibir a degradação de receptores mediada por PCSK9. Ativa AMPK celular.',
        safetyWarnings: ['Pode causar leve desconforto gástrico se ingerida em jejum absoluto; sempre ingerir junto a alimentos.']
      },
      {
        compound: 'Red Yeast Rice (Levedura Vermelha padronizada em Monacolina K 5-10mg) + Coenzima Q10 (Ubiquinol 100mg)',
        dosage: '1 cápsula à noite',
        evidenceGrade: 'A',
        timing: 'Após o jantar (pico de atividade da HMG-CoA redutase ocorre à noite)',
        biologicalMechanism: 'A Monacolina K atua como inibidor natural da HMG-CoA redutase hepática. O Ubiquinol é estritamente associado para evitar depleção mitocondrial muscular e prevenir mialgias.',
        safetyWarnings: ['Contraindicado em insuficiência hepática ativa. Monitorar transaminases (TGO/TGP) a cada 90 dias.']
      },
      {
        compound: 'Beta-Glucana Solúvel Concentrada (de Aveia)',
        dosage: '3.000 mg (3g) ao dia',
        evidenceGrade: 'A',
        timing: 'Pela manhã misturado ao iogurte/leite vegetal ou mingau frio',
        biologicalMechanism: 'Forma gel viscoso no trato digestivo que sequestra sais biliares ricos em colesterol, forçando sua excreção fecal e obrigando a conversão hepática de novo colesterol circulante em bile.',
        safetyWarnings: ['Necessita aumento proporcional de ingestão de água para evitar lentificação do trânsito intestinal.']
      },
      {
        compound: 'Ômega-3 Ultra Puro TG (com alta concentração EPA 1000mg / DHA 400mg)',
        dosage: '2 cápsulas ao dia',
        evidenceGrade: 'B',
        timing: 'Com a maior refeição do dia',
        biologicalMechanism: 'Reduz a síntese de VLDL e triglicerídeos no fígado e atenua a oxidação de lipoproteínas endoteliais.',
        safetyWarnings: ['Pausar 7 dias antes de cirurgias programadas devido à leve ação antiagregante.']
      }
    ],
    circadianNutritionRules: {
      mealFrequency: '3 refeições equilibradas + 1 lanche leve se necessário (evitar beliscar constante)',
      maxVolumePerMealMl: 550,
      recommendedWindow: 'Janela alimentar de 10 a 11 horas (ex: 08:00 às 19:00)',
      gastricEmptyingNotes: 'A digestão de gorduras saudáveis deve ser acompanhada de fibras solúveis para diminuir a área sob a curva lipêmica pós-prandial.'
    },
    exerciseGuidance: {
      optimalTypes: [
        'Treino aeróbio contínuo em Zona 2 (60-70% FCM) por 45-60 min (otimiza queima de ácidos graxos)',
        'Treino resistido / musculação moderada a pesada (3x por semana para sensibilidade insulínica)',
        'Caminhada pós-prandial de 15 minutos (reduz pico de triglicerídeos e glicose)'
      ],
      contraindicatedTypes: [
        'Sessões extenuantes de HIIT se houver fadiga adrenérgica ou recuperação do wearable < 40'
      ],
      maxIntensityPercentage: 85,
      adaptationsForLowRecovery: 'Se a recuperação do relógio for < 50, substituir musculação intensa por caminhada na esteira em Zona 2 e mobilidade articular.'
    },
    recommendedLabTests: [
      {
        testName: 'Perfil Lipídico Avançado (Colesterol Total, HDL, LDL direto, Não-HDL, VLDL, Triglicerídeos)',
        loincCode: '24331-1',
        repeatIntervalMonths: 3,
        clinicalRationale: 'Avaliar a curva de resposta à suplementação natural e dieta nos primeiros 90 dias.',
        targetOptimalRange: 'Colesterol Total < 200 mg/dL, LDL < 100 mg/dL (ou < 70 em alto risco)'
      },
      {
        testName: 'Apolipoproteína B (ApoB)',
        loincCode: '1871-6',
        repeatIntervalMonths: 3,
        clinicalRationale: 'Mede o número exato de partículas aterogênicas circulantes, sendo superior ao LDL isolado.',
        targetOptimalRange: '< 80 mg/dL'
      },
      {
        testName: 'PCR Ultrassensível (Proteína C Reativa)',
        loincCode: '30522-7',
        repeatIntervalMonths: 6,
        clinicalRationale: 'Mapeia a inflamação vascular de baixo grau e estresse endotelial.',
        targetOptimalRange: '< 0.8 mg/L'
      },
      {
        testName: 'Painel Hepático (TGO/AST, TGP/ALT, Gama-GT)',
        loincCode: '24325-3',
        repeatIntervalMonths: 3,
        clinicalRationale: 'Segurança hepática no uso de Monacolina K natural e Berberina.',
        targetOptimalRange: 'TGO < 35 U/L, TGP < 35 U/L'
      }
    ]
  },
  {
    id: 'gastritis_gerd',
    name: 'Gastrite Erosiva & Doença do Refluxo Gastroesofágico (DRGE)',
    category: 'gastrointestinal',
    description: 'Inflamação e lesão da mucosa do estômago decorrente de desbalanço entre fatores agressivos (ácido clorídrico, pepsina, H. pylori, estresse) e fatores protetores da barreira mucosa.',
    rootCauses: [
      'Quebra da camada de muco protetor por estresse agudo, cortisol elevado ou AINEs (anti-inflamatórios)',
      'Possível colonização bacteriana por Helicobacter pylori',
      'Refluxo de bile duodenogástrico ou hipocloridria paradoxal com fermentação intragástrica',
      'Refeições de alto volume consumidas rapidamente sem mastigação adequada'
    ],
    whatHarms: {
      foods: [
        'Café em jejum (mesmo descafeinado estimula secreção ácida gástrica direta)',
        'Bebidas alcoólicas e refrigerantes carbonatados (distensão do cárdia e irritação do epitélio)',
        'Pimentas ardidas ricas em capsaicina pura, vinagre em excesso e frutas ácidas concentradas sem amortecimento',
        'Alimentos ultraprocessados ricos em conservantes e frituras de difícil digestão'
      ],
      habits: [
        'Deitar-se antes de 2h30 a 3h após o término do jantar',
        'Consumir líquidos em grande quantidade durante as refeições principais (acima de 200ml)',
        'Comer sob estresse simpático ativado (inibe liberação de bicarbonato e fluxo sanguíneo na mucosa)'
      ],
      mechanisms: [
        'Retrodifusão de íons H+ para a submucosa gástrica desencadeando edema e sangramento capilar',
        'Relaxamento transitório do esfíncter esofágico inferior (EEI)'
      ]
    },
    whatHelps: {
      foods: [
        'Suco de batata-doce crua ou couve fresca batida com água pela manhã (mucilagem protetora)',
        'Caldo de ossos caseiro ou colágeno rico em glicina e prolina para cicatrização tecidual',
        'Purê de inhame, abóbora cozida no vapor, abobrinha e cenoura macia',
        'Chá morno de espinheira-santa (Maytenus ilicifolia) e camomila após as refeições',
        'Papas de aveia cozidas com água ou leite vegetal neutro'
      ],
      habits: [
        'Elevação da cabeceira da cama em 15 cm se houver refluxo noturno',
        'Fracionamento alimentar com volumes contidos (não passar de 400ml por refeição)',
        'Mastigação lenta com repouso dos talheres na mesa entre cada garfada'
      ],
      functionalCompounds: [
        'Taninos protetores e fitoquímicos da Espinheira-Santa (gastroprotetor natural comprovado)',
        'Zinco-Carnosina (adere seletivamente às úlceras e acelera reepitelização gástrica)',
        'DGL (Alcaçuz Deglicirrizinado - estimula secreção endógena de muco sem alterar pressão arterial)',
        'L-Glutamina (substrato energético vital para os enterócitos e colonócitos)'
      ]
    },
    naturalSupplements: [
      {
        compound: 'Zinco L-Carnosina (Polaprezinc)',
        dosage: '75 mg 2x ao dia',
        evidenceGrade: 'A',
        timing: 'Após o café da manhã e após o jantar (ou antes de deitar)',
        biologicalMechanism: 'Quilato bioativo que se fixa eletrostaticamente nas áreas inflamadas e erosões gástricas por até 12 horas, estimulando a síntese de proteínas de choque térmico (HSP70) e cicatrização da mucosa.',
        safetyWarnings: ['Excelente tolerabilidade; não exceder 150mg/dia para evitar desequilíbrio com cobre.']
      },
      {
        compound: 'Extrato Padronizado de Espinheira-Santa (Maytenus ilicifolia)',
        dosage: '350 mg (ou infusão de 3g de folhas secas em 150ml de água)',
        evidenceGrade: 'A',
        timing: '30 minutos antes das principais refeições',
        biologicalMechanism: 'Ação antiúlcera e antisecretora mediada por taninos e triterpenos que formam uma película protetora físico-química e inibem a bomba de prótons de forma fisiológica sem anacidez.',
        safetyWarnings: ['Evitar durante a gravidez e lactação.']
      },
      {
        compound: 'DGL - Alcaçuz Deglicirrizinado Mastigável',
        dosage: '400 mg mastigável',
        evidenceGrade: 'B',
        timing: 'Mastigar 15 minutos antes do almoço e do jantar',
        biologicalMechanism: 'Aumenta a vida útil das células da mucosa gástrica e estimula a produção de muco denso e fluxo microvascular gástrico sem a fração de glicirrizina (evitando hipertensão).',
        safetyWarnings: ['Certificar-se de que é a forma DGL (deglicirrizinada).']
      },
      {
        compound: 'L-Glutamina Pura Micronizada',
        dosage: '5.000 mg (5g)',
        evidenceGrade: 'B',
        timing: 'Pela manhã em jejum, dissolvida em 100ml de água morna',
        biologicalMechanism: 'Fornece combustível mitocondrial primário para renovação e reparo do epitélio do trato gastrointestinal superior e junções oclusivas (tight junctions).',
        safetyWarnings: ['Pacientes com esteatose avançada ou epilepsia devem consultar médico assistente.']
      }
    ],
    circadianNutritionRules: {
      mealFrequency: '4 a 5 refeições menores (refeições fracionadas)',
      maxVolumePerMealMl: 400,
      recommendedWindow: 'Encerrar última refeição sólida impreterivelmente até as 19:30 (ou 3h antes de dormir)',
      gastricEmptyingNotes: 'Evitar gorduras concentradas no jantar para não lentificar o esvaziamento gástrico durante o sono.'
    },
    exerciseGuidance: {
      optimalTypes: [
        'Caminhadas ao ar livre em ritmo moderado',
        'Pilates clínico e ioga com posturas verticais (evitar posturas invertidas)',
        'Musculação controlada com respiração contínua (sem manobra de Valsalva)'
      ],
      contraindicatedTypes: [
        'Abdominais intensos com compressão mecânica intra-abdominal',
        'Crossfit com salto ou impacto logo após as refeições',
        'Posturas invertidas de ioga (downward dog prolongado)'
      ],
      maxIntensityPercentage: 75,
      adaptationsForLowRecovery: 'Se a recuperação do relógio for < 50, realizar caminhada leve pós-refeição de 20 minutos com foco em respiração diafragmática para modular o nervo vago.'
    },
    recommendedLabTests: [
      {
        testName: 'Endoscopia Digestiva Alta (EDA) com Biópsia para H. pylori',
        loincCode: '18748-4',
        repeatIntervalMonths: 12,
        clinicalRationale: 'Verificação visual de cicatrização das erosões e exclusão de metaplasia ou infecção bacteriana ativa.',
        targetOptimalRange: 'Mucosa gástrica íntegra sem erosões ou atrofia, urease negativa'
      },
      {
        testName: 'Vitamina B12 (Cobalamina) e Ferritina',
        loincCode: '2132-9',
        repeatIntervalMonths: 6,
        clinicalRationale: 'A inflamação da mucosa oxíntica pode prejudicar o fator intrínseco e a absorção gástrica de ferro e B12.',
        targetOptimalRange: 'Vitamina B12 > 500 pg/mL, Ferritina 50-150 ng/mL'
      }
    ]
  },
  {
    id: 'lactose_intolerance',
    name: 'Intolerância Primária / Secundária à Lactose',
    category: 'intolerance',
    description: 'Deficiência ou baixa expressão da enzima lactase (beta-galactosidase) na borda em escova dos enterócitos do intestino delgado, levando à fermentação osmótica no cólon.',
    rootCauses: [
      'Declínio geneticamente programado da lactase pós-infância (não-persistência da lactase tipo adulto)',
      'Dano secundário às vilosidades intestinais decorrente de gastrite, disbiose, celíaca ou gastroenterite aguda',
      'Sobrecarga abrupta de derivados lácteos de alto teor osmótico'
    ],
    whatHarms: {
      foods: [
        'Leite de vaca fluido convencional, leite condensado, doce de leite e sorvetes comuns',
        'Queijos frescos de alto teor de soro e umidade (queijo minas frescal, ricota comum, cottage comum)',
        'Sobremesas cremosas industrializadas contendo sólidos de leite em pó'
      ],
      habits: [
        'Consumo de lácteos ricos em lactose com estômago vazio',
        'Ignorar sintomas de distensão abdominal e flatulência contínua que geram microinflamação na barreira mucosa'
      ],
      mechanisms: [
        'Puxada osmótica de água para a luz intestinal seguida de fermentação colônica acelerada por bactérias produtoras de H2, CH4 e CO2'
      ]
    },
    whatHelps: {
      foods: [
        'Queijos maturados e curados por mais de 6 meses (Parmesão, Grana Padano, Cheddar envelhecido - teor de lactose naturalmente residual < 0,1%)',
        'Iogurtes fermentados de longa fermentação (as bactérias Lactobacillus bulgaricus e Streptococcus thermophilus pré-digerem a lactose)',
        'Bebidas vegetais naturais fortificadas (leite de amêndoas, aveia sem glúten, coco)',
        'Ghee (manteiga clarificada com traços desprezíveis de caseína e lactose)'
      ],
      habits: [
        'Estratégia flexível de adaptação de acordo com a rotina e preferência pessoal do usuário',
        'Uso consciente de enzima lactase exógena antes de refeições sociais ou familiares'
      ],
      functionalCompounds: [
        'Enzima Lactase exógena em cápsula ou comprimido (padronizada em FCC ALU)',
        'Probióticos com capacidade hidrolítica comprovada (Bifidobacterium longum e Lactobacillus acidophilus)',
        'Cálcio quelado ou de algas marinhas (Lithothamnium) para garantir aporte ósseo na ausência de lácteos'
      ]
    },
    naturalSupplements: [
      {
        compound: 'Enzima Lactase (Beta-galactosidase fúngica de Aspergillus oryzae)',
        dosage: '9.000 a 10.000 FCC ALU',
        evidenceGrade: 'A',
        timing: 'Imediatamente antes da primeira garfada da refeição contendo derivados lácteos',
        biologicalMechanism: 'Quebra a ligação beta-1,4-glicosídica da lactose no lúmen gástrico e proximal antes que ela atinja o íleo terminal e cólon, impedindo o efeito osmótico.',
        safetyWarnings: ['Não tem efeito cumulativo; deve ser ingerida no ato da refeição com lactose.']
      },
      {
        compound: 'Complexo Probiótico de Suporte à Barreira (L. rhamnosus GG + B. lactis)',
        dosage: '10 bilhões de UFC',
        evidenceGrade: 'B',
        timing: 'Antes de dormir com um copo de água',
        biologicalMechanism: 'Favorece a eubiose intestinal e modula a resposta imune da mucosa contra antígenos alimentares.',
        safetyWarnings: ['Manter em local seco e fresco.']
      }
    ],
    circadianNutritionRules: {
      mealFrequency: 'Livre de acordo com o padrão circadiano do indivíduo',
      maxVolumePerMealMl: 500,
      recommendedWindow: 'Distribuir ingestão de cálcio e proteínas ao longo do dia',
      gastricEmptyingNotes: 'Produtos com lactase ou zero lactose devem ser digeridos normalmente sem restrição especial de volume.'
    },
    exerciseGuidance: {
      optimalTypes: ['Qualquer modalidade de treino conforme a recuperação do dia.'],
      contraindicatedTypes: ['Nenhum exercício contraindicado diretamente pela condição.'],
      maxIntensityPercentage: 100,
      adaptationsForLowRecovery: 'Seguir recomendação do sensor de sono do wearable.'
    },
    recommendedLabTests: [
      {
        testName: 'Teste Genético de Intolerância à Lactose (MCM6 polimorfismo C/T-13910)',
        loincCode: '49584-6',
        repeatIntervalMonths: 120, // Teste genético feito 1x na vida
        clinicalRationale: 'Diferencia de forma indolor se a intolerância é permanente (genótipo C/C) ou secundária reversível (C/T ou T/T).',
        targetOptimalRange: 'Identificação de tolerância ou hipolactasia do tipo adulto'
      },
      {
        testName: 'Cálcio Iônico, Fósforo e Vitamina D (25-OH-D)',
        loincCode: '17861-6',
        repeatIntervalMonths: 6,
        clinicalRationale: 'Garantir que o manejo nutricional sem lácteos não comprometeu a densidade mineral óssea.',
        targetOptimalRange: 'Vitamina D > 40-50 ng/mL, Cálcio normal'
      }
    ]
  },
  {
    id: 'sibo_gut_dysbiosis',
    name: 'Supercrescimento Bacteriano no Intestino Delgado (SIBO) & Disbiose',
    category: 'gastrointestinal',
    description: 'Proliferação desordenada de bactérias colônicas na luz do intestino delgado, competindo por nutrientes e produzindo gases (hidrogênio ou metano), estufamento e má-absorção.',
    rootCauses: [
      'Falha do Complexo Motor Migratório (CMM) entre as refeições decorrente de beliscar contínuo ou estresse',
      'Incompetência da válvula ileocecal',
      'Uso prévio abusivo de inibidores de bomba de prótons (omeprazol) que removem o filtro ácido natural',
      'Hipomotilidade intestinal'
    ],
    whatHarms: {
      foods: [
        'FODMAPs fermentáveis em excesso na fase inicial (alho cru, cebola, feijões sem remolho, maçã, mel)',
        'Açúcares simples e adoçantes polióis (xilitol, sorbitol, maltitol)',
        'Glúten refinado e alimentos inflamatórios'
      ],
      habits: [
        'Beliscar alimentos a cada 1 ou 2 horas (interrompe o complexo motor migratório que limpa o intestino)',
        'Dormir logo após comer',
        'Consumo de probióticos inadequados durante a fase ativa de SIBO (pode piorar o estufamento)'
      ],
      mechanisms: [
        'Fermentação precoce de carboidratos complexos no intestino delgado gerando estiramento das alças e dor'
      ]
    },
    whatHelps: {
      foods: [
        'Dieta com modulação estratégica de FODMAPs temporária de 4 a 6 semanas',
        'Proteínas limpas e de fácil digestão (frango orgânico, ovos cozidos, peixes brancos, tofu firme)',
        'Vegetais tolerados com baixa fermentação (cenoura cozida, abobrinha, rúcula, espinafre)',
        'Chá de gengibre fresco ralado com infusão de hortelã (estimulante procinético natural)'
      ],
      habits: [
        'Espaçamento estrito de 3h30 a 4h entre as refeições para ativar a fase III do Complexo Motor Migratório',
        'Caminhada procinética de 10 minutos após as refeições'
      ],
      functionalCompounds: [
        'Óleo de orégano microencapsulado e Berberina (antimicrobianos herbais de amplo espectro)',
        'Gengibre / Extrato de alcachofra (procinéticos naturais que ativam o peristaltismo gástrico e intestinal)',
        'Goma acácia hidrolisada (prebiótico tolerado sem gás colônico)'
      ]
    },
    naturalSupplements: [
      {
        compound: 'Extrato de Gengibre Padronizado (Gingeróis) + Extrato de Folhas de Alcachofra',
        dosage: '100 mg Gengibre + 200 mg Alcachofra',
        evidenceGrade: 'A',
        timing: 'Antes de dormir em jejum de pelo menos 3 horas',
        biologicalMechanism: 'Estimula receptores 5-HT4 e a motilina, disparando as ondas do Complexo Motor Migratório (CMM) noturno, que "varrem" o conteúdo bacteriano de volta ao cólon.',
        safetyWarnings: ['Contraindicado em obstrução das vias biliares.']
      },
      {
        compound: 'Óleo Essencial de Orégano Microencapsulado (Carvacrol > 70%)',
        dosage: '150 mg',
        evidenceGrade: 'B',
        timing: 'Com o almoço durante ciclos estruturados de 21 a 30 dias',
        biologicalMechanism: 'Desestabiliza as membranas celulares de bactérias atípicas e fungos que colonizam o intestino delgado, sem agredir os lactobacilos residentes em doses fisiológicas.',
        safetyWarnings: ['Fazer ciclos; não usar de forma ininterrupta por mais de 30 dias.']
      }
    ],
    circadianNutritionRules: {
      mealFrequency: '3 refeições bem estruturadas (SEM beliscar entre elas)',
      maxVolumePerMealMl: 450,
      recommendedWindow: 'Mínimo de 4 horas de intervalo sem calorias entre café, almoço e jantar',
      gastricEmptyingNotes: 'Fundamental para a limpeza do intestino delgado pelo Complexo Motor Migratório.'
    },
    exerciseGuidance: {
      optimalTypes: ['Exercícios moderados, caminhada rápida, natação, treino funcional'],
      contraindicatedTypes: ['Exercícios que comprimam excessivamente o abdômen em crises agudas'],
      maxIntensityPercentage: 80,
      adaptationsForLowRecovery: 'Se a recuperação do relógio for < 50, priorizar caminhada ao ar livre com respiração profunda.'
    },
    recommendedLabTests: [
      {
        testName: 'Teste Respiratório do Hidrogênio e Metano Expirado com Lactulose',
        loincCode: '29891-9',
        repeatIntervalMonths: 6,
        clinicalRationale: 'Padrão ouro para confirmar remissão de SIBO e guiar reintrodução gradual de alimentos.',
        targetOptimalRange: 'Sem elevação precoce de H2 (>20 ppm) ou CH4 (>10 ppm) nos primeiros 90 min'
      }
    ]
  }
];
