class ModuleAPICartoSerializer < ActiveModel::Serializer
  attributes :use_api_carto,
    :quartiers_prioritaires,
    :cadastre
end
