
export const translations = {
  fr: {
    nav: {
      data: "Données",
      pricing: "Tarifs",
      account: "Mon Compte"
    },
    hero: {
      newVersion: "Nouvelle version 2.5 disponible",
      title1: "Intelligence Marché",
      title2: "Hôtellerie & Tourisme",
      subtitle: "Accédez aux données INSEE, Sirene et Open Data en temps réel. Études de marché professionnelles générées par IA.",
      placeholder: "Recherchez une adresse précise, une ville ou un code postal...",
      analyze: "Analyser",
      samples: "Découvrir des exemples de rapports",
      viewStudy: "Voir l'étude"
    },
    examples: {
      biarritz: { label: "Loisirs & Côte", city: "Biarritz", stats: "TO Est. 74%" },
      lyon: { label: "Affaires & MICE", city: "Lyon", stats: "RevPAR +12%" },
      courchevel: { label: "Ultra-Luxe / Ski", city: "Courchevel", stats: "P.M. > 850€" }
    },
    steps: {
      init: "Géocodage Précis & Initialisation...",
      sirene: "Extraction des Données SIRENE (Entreprises)...",
      insee: "Analyse des Données INSEE (Démographie & Tourisme)...",
      iso: "Calcul des Isochrones (Zones de Chalandise)...",
      sncf: "Croisement Open Data SNCF & Cartographie...",
      comp: "Analyse Concurrentielle & Immobilière..."
    },
    header: {
      official: "Rapport Officiel",
      generated: "Généré le",
      settings: "Options PDF",
      download: "Télécharger"
    },
    kpi: {
      occupancy: "Taux d'Occupation Est.",
      adr: "Prix Moyen (ADR)",
      revpar: "RevPAR Potentiel",
      supply: "Croissance de l'Offre"
    },
    summary: {
      title: "Synthèse Exécutive & Avis d'Expert"
    },
    catchment: {
      title: "Analyse de la Zone de Chalandise",
      macro: "Chalandise",
      micro: "Quartier",
      unavailable: "Données géographiques indisponibles",
      analysis: "Analyse de la zone de chalandise..."
    },
    demographics: {
      title: "II. Démographie & Immobilier",
      source: "Source : INSEE",
      pop: "Population",
      trend: "Tend. 90-24",
      income: "Revenus",
      dynamics: "Dynamique Démographique (1990 - 2024)",
      histPop: "Population Historique",
      realEstate: "Contexte Immobilier",
      price: "Prix Moyen m²",
      rent: "Loyers Commerciaux"
    },
    economy: {
      title: "III. Tissu Économique Local",
      source: "Source : SIRENE",
      employers: "Employeurs Clés",
      dynamics: "Dynamique Économique",
      sectors: "Secteurs Porteurs",
      accessibility: "Accessibilité Multimodale",
      score: "Score",
      road: "Réseau Routier"
    },
    tourism: {
      title: "IV. Tourisme & Demande",
      source: "Source : INSEE (DS_TOUR_FREQ) & Melodi",
      origin: "Origine des Nuitées (Saisonnalité)",
      breakdown: "Répartition : Résidents Domestiques vs Internationaux.",
      duration: "Durée Moyenne de Séjour",
      durationDesc: "Évolution de la durée moyenne de séjour (jours) sur l'année.",
      trend: "Tendance Historique (10 Ans)",
      trendDesc: "Volume annuel de nuitées depuis 2014, incluant la reprise post-COVID.",
      events: "Événements Majeurs",
      attractions: "Attractions Clés",
      audience: "Segmentation Clientèle",
      seasonality: "Analyse de la Saisonnalité"
    },
    competition: {
      title: "V. Analyse Concurrentielle Détaillée (Compset)",
      capacity: "Capacité & Chambres",
      total: "chambres totales",
      std: "Standard",
      suite: "Suites / Deluxe",
      amenities: "Équipements Clés",
      services: "Services Premium",
      positioning: "Positionnement",
      strength: "Force",
      weakness: "Faiblesse",
      view: "Voir"
    },
    trends: {
      title: "Tendances de Performance (Données Historiques)",
      analysis: "Analyse RevPAR & TO :",
      seasonality: "Saisonnalité Mensuelle Observée (12 derniers mois)",
      source: "Données basées sur le profil standard de la destination"
    },
    supply: {
      title: "VI. Offre & Capacité",
      source: "Source : INSEE - DS_TOUR_CAP",
      hotels: "Hôtels",
      rooms: "Chambres",
      campings: "Campings",
      residences: "Residences",
      analysis: "Analyse de l'Offre :",
      distribution: "Répartition de l'Offre par Gamme"
    },
    swot: {
      title: "Matrice Stratégique SWOT",
      s: "Forces",
      w: "Faiblesses",
      o: "Opportunités",
      t: "Menaces"
    },
    sources: {
      verified: "Sources Vérifiées",
      link: "Source"
    },
    pricing: {
      title: "Des tarifs adaptés à vos besoins",
      subtitle: "Choisissez le plan qui correspond à votre volume d'analyse.",
      freemium: { title: "Freemium", price: "Gratuit", btn: "Créer un compte" },
      adhoc: { title: "Ad-hoc", price: "50€", period: "/ dossier", btn: "Commander un dossier", popular: "Recommandé" },
      enterprise: { title: "Entreprise", price: "1 999€", period: "/ mois", btn: "Contacter les ventes" }
    },
    login: {
      title: "Connexion Pro",
      subtitle: "Accédez à vos études de marché et analyses.",
      email: "Adresse email",
      password: "Mot de passe",
      btn: "Se connecter",
      forgot: "Mot de passe oublié ?",
      security: "Sécurisé par chiffrement SSL 256 bits"
    },
    pdf: {
      title: "Personnaliser l'Export PDF",
      desc: "Sélectionnez les sections à inclure dans votre rapport PDF.",
      cancel: "Annuler",
      export: "Exporter PDF",
      generating: "Génération..."
    },
    bp: {
        title: "Business Plan Expert (USALI)",
        subtitle: "Édition complète 100% interactive. Les lignes de détail (Growth & Ratio) se calculent automatiquement.",
        structure: {
            title: "Structure de l'Actif",
            rooms: "Nombre de Chambres",
            surface: "Surface Totale (m²)"
        },
        stabilizedRev: "CA Stabilisé (Y3)",
        stabilizedEbitda: "EBITDA Stabilisé",
        avgMargin: "Marge Moyenne",
        cashFlow: "Cash Flow Cumulé",
        table: {
            item: "POSTE (k€)",
            kpi: "Indicateurs Clés",
            occ: "Taux d'Occupation (%)",
            adr: "Prix Moyen (ADR €)",
            revpar: "RevPAR (€)",
            rev: "Revenus",
            revRoom: "Revenus Hébergement",
            revFb: "Revenus Restauration (F&B)",
            revOther: "Autres Revenus",
            revTotal: "TOTAL REVENUS",
            opExp: "Charges Opérationnelles",
            cosRoom: "Achats & Charges Rooms",
            payRoom: "Salaires Rooms",
            cosFb: "Achats & Charges F&B",
            payFb: "Salaires F&B",
            deptIncome: "Marge Brute Départements",
            undist: "Charges Non Distribuées",
            admin: "Administration & Général",
            sales: "Commercial & Marketing",
            pom: "Maintenance (POM)",
            util: "Energie & Fluides",
            gop: "GOP (RBE)",
            fixed: "Charges Fixes",
            fees: "Redevance de Gestion",
            ins: "Assurances & Taxes",
            ebitda: "EBITDA",
            margin: "% CA Total",
            invest: "Investissements",
            ffe: "Réserve FF&E",
            capex: "Capex Propriétaire",
            ncf: "CASH FLOW NET",
            growth: "Var. N-1",
            ratio: "% CA Total"
        },
        chartTitle: "Trajectoire Financière (10 Ans)",
        analysisTitle: "Analyse de la performance projetée",
        analysis: {
            intro: "Afin de déterminer la valeur du fonds de commerce du futur hôtel à",
            intro2: "nous avons projeté les performances sur une période de 10 ans.",
            rampup: "Nous avons considéré une montée en puissance des opérations s'étalant sur une période de 3 ans. Les performances se stabilisent en Année 3, atteignant un TO de",
            mix: "S'agissant du mix revenus, les revenus Restauration (F&B) s'élèvent à environ",
            gop: "La marge GOP (Gross Operating Profit) projetée en Année 1 se monte à",
            ebitda: "Après déduction des charges fixes, l'hôtel dégage une marge EBITDA s'élevant à environ"
        }
    },
    valo: {
      title: "Valorisation Avancée (Multi-Méthodes)",
      subtitle: "Estimation détaillée connectée au Business Plan (10 ans). Prise en compte des coûts d'acquisition et Capex.",
      grossVal: "Valeur Acte en Main",
      netVal: "Valeur Net Vendeur",
      method1: "Méthode 1 : Capitalisation (Yield)",
      method1Desc: "EBITDA stabilisé (Année 3) / Taux de Cap.",
      method2: "Méthode 2 : Discounted Cash Flow (DCF)",
      method2Desc: "Somme des Cash Flows actualisés (10 ans) + Valeur Terminale.",
      method3: "Méthode 3 : Comparables",
      method3Desc: "Valeur de marché basée sur le prix par clé.",
      params: {
        capRate: "Taux de Cap. (%)",
        discountRate: "Taux d'Actualisation (%)",
        exitCap: "Taux de Sortie (%)",
        priceKey: "Prix / Clé (€)",
        transCost: "Frais d'Acquisition (%)",
        capex: "Capex Initial / Rénov (€)"
      },
      results: {
        value: "Valeur Estimée",
        perKey: "Valeur / Clé",
        perSqm: "Valeur / m²"
      },
      transactions: {
        title: "Détail des Transactions Comparables",
        colName: "Nom",
        colLoc: "Lieu",
        colPrice: "Prix",
        colKey: "Prix/Clé",
        colStars: "Étoiles",
        colBuyer: "Acheteur",
        colYield: "Yield"
      }
    }
  },
  en: {
    nav: {
      data: "Data",
      pricing: "Pricing",
      account: "My Account"
    },
    hero: {
      newVersion: "New version 2.5 available",
      title1: "Market Intelligence",
      title2: "Hotel & Tourism",
      subtitle: "Access real-time INSEE, Sirene, and Open Data. Professional AI-generated market studies.",
      placeholder: "Search precise address, city, or zip code...",
      analyze: "Analyze",
      samples: "Discover sample reports",
      viewStudy: "View Study"
    },
    examples: {
      biarritz: { label: "Leisure & Coast", city: "Biarritz", stats: "Est. Occ 74%" },
      lyon: { label: "Business & MICE", city: "Lyon", stats: "RevPAR +12%" },
      courchevel: { label: "Ultra-Luxury / Ski", city: "Courchevel", stats: "ADR > 850€" }
    },
    steps: {
      init: "Precise Geocoding & Initialization...",
      sirene: "Extracting SIRENE Data (Companies)...",
      insee: "Analyzing INSEE Data (Demographics & Tourism)...",
      iso: "Computing Isochrones (Catchment Area)...",
      sncf: "Crossing SNCF Open Data & Maps...",
      comp: "Competitive & Real Estate Analysis..."
    },
    header: {
      official: "Official Report",
      generated: "Generated on",
      settings: "PDF Options",
      download: "Download"
    },
    kpi: {
      occupancy: "Est. Occupancy Rate",
      adr: "ADR (Avg. Daily Rate)",
      revpar: "Potential RevPAR",
      supply: "Supply Growth"
    },
    summary: {
      title: "Executive Summary & Expert Opinion"
    },
    catchment: {
      title: "Catchment Area Analysis",
      macro: "Catchment",
      micro: "District",
      unavailable: "Geographic data unavailable",
      analysis: "Catchment area analysis..."
    },
    demographics: {
      title: "II. Demographics & Real Estate",
      source: "Source: INSEE",
      pop: "Population",
      trend: "Trend 90-24",
      income: "Income",
      dynamics: "Demographic Dynamics (1990 - 2024)",
      histPop: "Historical Population",
      realEstate: "Real Estate Context",
      price: "Avg Price m²",
      rent: "Commercial Rents"
    },
    economy: {
      title: "III. Local Economic Fabric",
      source: "Source: SIRENE",
      employers: "Key Employers",
      dynamics: "Economic Dynamics",
      sectors: "Growth Sectors",
      accessibility: "Multimodal Accessibility",
      score: "Score",
      road: "Road Network"
    },
    tourism: {
      title: "IV. Tourism & Demand",
      source: "Source: INSEE (DS_TOUR_FREQ) & Melodi",
      origin: "Origin of Nights (Seasonality)",
      breakdown: "Breakdown: Domestic Residents vs International.",
      duration: "Average Stay Duration",
      durationDesc: "Evolution of the average length of stay (days) throughout the year.",
      trend: "Historical Trend (10 Years)",
      trendDesc: "Annual volume of nights since 2014, including post-COVID recovery.",
      events: "Major Events",
      attractions: "Key Attractions",
      audience: "Target Audience Segmentation",
      seasonality: "Seasonality Analysis"
    },
    competition: {
      title: "V. Detailed Competitive Analysis (Compset)",
      capacity: "Capacity & Rooms",
      total: "total rooms",
      std: "Standard",
      suite: "Suites / Deluxe",
      amenities: "Key Amenities",
      services: "Premium Services",
      positioning: "Positioning",
      strength: "Strength",
      weakness: "Weakness",
      view: "View"
    },
    trends: {
      title: "Performance Trends (Historical Data)",
      analysis: "RevPAR & Occ. Analysis:",
      seasonality: "Observed Monthly Seasonality (Last 12 months)",
      source: "Data based on the destination's standard profile"
    },
    supply: {
      title: "VI. Supply & Capacity",
      source: "Source: INSEE - DS_TOUR_CAP",
      hotels: "Hotels",
      rooms: "Rooms",
      campings: "Campings",
      residences: "Residences",
      analysis: "Supply Analysis:",
      distribution: "Supply Distribution by Rating"
    },
    swot: {
      title: "Strategic SWOT Matrix",
      s: "Strengths",
      w: "Weaknesses",
      o: "Opportunities",
      t: "Threats"
    },
    sources: {
      verified: "Verified Sources",
      link: "Source"
    },
    pricing: {
      title: "Pricing plans for your needs",
      subtitle: "Choose the plan that fits your volume and depth of analysis.",
      freemium: { title: "Freemium", price: "Free", btn: "Create Account" },
      adhoc: { title: "Ad-hoc", price: "50€", period: "/ file", btn: "Order a File", popular: "Recommended" },
      enterprise: { title: "Enterprise", price: "1 999€", period: "/ month", btn: "Contact Sales" }
    },
    login: {
      title: "Pro Login",
      subtitle: "Access your market studies and analysis.",
      email: "Email address",
      password: "Password",
      btn: "Sign In",
      forgot: "Forgot password?",
      security: "Secured by 256-bit SSL encryption"
    },
    pdf: {
      title: "Customize PDF Export",
      desc: "Select the sections to include in your PDF report.",
      cancel: "Cancel",
      export: "Export PDF",
      generating: "Generating..."
    },
    bp: {
        title: "Expert Business Plan (USALI)",
        subtitle: "Full 100% interactive edition. Detail rows (Growth & Ratio) calculate automatically.",
        structure: {
            title: "Asset Structure",
            rooms: "Number of Rooms",
            surface: "Total Surface (m²)"
        },
        stabilizedRev: "Stabilized Rev (Y3)",
        stabilizedEbitda: "Stabilized EBITDA",
        avgMargin: "Avg Margin",
        cashFlow: "Cumul. Cash Flow",
        table: {
            item: "ITEM (k€)",
            kpi: "Key Indicators",
            occ: "Occupancy Rate (%)",
            adr: "ADR (€)",
            revpar: "RevPAR (€)",
            rev: "Revenues",
            revRoom: "Room Revenue",
            revFb: "F&B Revenue",
            revOther: "Other Revenue",
            revTotal: "TOTAL REVENUE",
            opExp: "Operating Expenses",
            cosRoom: "Rooms COS & Exp.",
            payRoom: "Rooms Payroll",
            cosFb: "F&B COS & Exp.",
            payFb: "F&B Payroll",
            deptIncome: "Total Dept Income",
            undist: "Undistributed Expenses",
            admin: "Admin & General",
            sales: "Sales & Marketing",
            pom: "Maintenance (POM)",
            util: "Utilities",
            gop: "GOP",
            fixed: "Fixed Charges",
            fees: "Management Fees",
            ins: "Insurance & Taxes",
            ebitda: "EBITDA",
            margin: "% Total Rev",
            invest: "Investments",
            ffe: "FF&E Reserve",
            capex: "Owner Capex",
            ncf: "NET CASH FLOW",
            growth: "Var. N-1",
            ratio: "% Revenue"
        },
        chartTitle: "Financial Trajectory (10 Years)",
        analysisTitle: "Projected Performance Analysis",
        analysis: {
            intro: "To determine the value of the future hotel business in",
            intro2: "we have projected performance over a 10-year period.",
            rampup: "We assumed a ramp-up period of 3 years. The hotel's performance stabilizes in Year 3, reaching an Occupancy Rate of",
            mix: "Regarding revenue mix, Food & Beverage (F&B) revenues amount to approximately",
            gop: "The projected GOP margin (Gross Operating Profit) in Year 1 is",
            ebitda: "After deducting fixed charges, the hotel generates an EBITDA margin of approximately"
        }
    },
    valo: {
      title: "Advanced Valuation (Multi-Method)",
      subtitle: "Detailed asset valuation connected to 10-Year BP. Includes Acquisition Costs and initial Capex.",
      grossVal: "Gross Asset Value",
      netVal: "Net Seller Value",
      method1: "Method 1: Capitalization (Yield)",
      method1Desc: "Based on stabilized EBITDA (Year 3) capitalized into perpetuity.",
      method2: "Method 2: Discounted Cash Flow (DCF)",
      method2Desc: "Discounting of 10-year Cash Flows + Terminal Value.",
      method3: "Method 3: Transaction Comparables",
      method3Desc: "Based on market value per key (Recent transactions).",
      params: {
        capRate: "Cap Rate (%)",
        discountRate: "Discount Rate (%)",
        exitCap: "Exit Cap Rate (%)",
        priceKey: "Price / Key (€)",
        transCost: "Acquisition Costs (%)",
        capex: "Initial Capex / Reno (€)"
      },
      results: {
        value: "Estimated Value",
        perKey: "Value / Key",
        perSqm: "Value / m²"
      },
      transactions: {
        title: "Comparables Transactions Details",
        colName: "Name",
        colLoc: "Location",
        colPrice: "Price",
        colKey: "Price/Key",
        colStars: "Stars",
        colBuyer: "Buyer",
        colYield: "Yield"
      }
    }
  }
};