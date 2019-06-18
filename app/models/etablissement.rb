class Etablissement < ApplicationRecord
  belongs_to :dossier, -> { unscope(where: :hidden_at) }

  has_one :champ, class_name: 'Champs::SiretChamp'
  has_many :exercices, dependent: :destroy

  accepts_nested_attributes_for :exercices

  validates :siret, presence: true
  validates :dossier_id, uniqueness: { allow_nil: true }

  def search_terms
    [
      entreprise_siren,
      entreprise_numero_tva_intracommunautaire,
      entreprise_forme_juridique,
      entreprise_forme_juridique_code,
      entreprise_nom_commercial,
      entreprise_raison_sociale,
      entreprise_siret_siege_social,
      entreprise_nom,
      entreprise_prenom,
      association_rna,
      association_titre,
      association_objet,
      siret,
      naf,
      libelle_naf,
      adresse,
      code_postal,
      localite,
      code_insee_localite
    ]
  end

  def siren
    entreprise_siren
  end

  def geo_adresse
    [numero_voie, type_voie, nom_voie, complement_adresse, code_postal, localite].join(' ')
  end

  def inline_adresse
    # squeeze needed because of space in excess in the data
    [
      "#{numero_voie} #{type_voie} #{nom_voie}",
      complement_adresse,
      "#{code_postal} #{localite}"
    ].reject(&:blank?).join(', ').squeeze(' ')
  end

  def association?
    association_rna.present?
  end

  def entreprise
    Entreprise.new(
      siren: entreprise_siren,
      capital_social: entreprise_capital_social,
      numero_tva_intracommunautaire: entreprise_numero_tva_intracommunautaire,
      forme_juridique: entreprise_forme_juridique,
      forme_juridique_code: entreprise_forme_juridique_code,
      nom_commercial: entreprise_nom_commercial,
      raison_sociale: entreprise_raison_sociale,
      siret_siege_social: entreprise_siret_siege_social,
      code_effectif_entreprise: entreprise_code_effectif_entreprise,
      date_creation: entreprise_date_creation,
      nom: entreprise_nom,
      prenom: entreprise_prenom,
      inline_adresse: inline_adresse
    )
  end
end
