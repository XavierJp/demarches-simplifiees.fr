class APIEntreprise::ExercicesJob < APIEntreprise::Job
  rescue_from(APIEntreprise::API::BadFormatRequest) do |exception|
  end

  def perform(etablissement_id, procedure_id)
    etablissement = Etablissement.find(etablissement_id)
    etablissement_params = APIEntreprise::ExercicesAdapter.new(etablissement.siret, procedure_id).to_params
    etablissement.update!(etablissement_params)
  end
end
