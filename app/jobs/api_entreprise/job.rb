class APIEntreprise::Job < ApplicationJob
  DEFAULT_MAX_ATTEMPTS_API_ENTREPRISE_JOBS = 5

  rescue_from(APIEntreprise::API::ResourceNotFound) do |exception|
    error(self, exception)
  end

  rescue_from(APIEntreprise::API::BadFormatRequest) do |exception|
    error(self, exception)
  end

  def error(job, exception)
    # override ApplicationJob#error to avoid reporting to sentry
  end

  def max_attempts
    ENV.fetch("MAX_ATTEMPTS_API_ENTREPRISE_JOBS", DEFAULT_MAX_ATTEMPTS_API_ENTREPRISE_JOBS).to_i
  end
end
