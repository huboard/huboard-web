class JobResolver
  include Singleton
  class Noop
    def self.perform_later(*args); end
  end
  def initialize
    @jobs = UberDictionary.new ->(params) {
      jobs = []
      [
       "saas/app/#{params[:controller]}_#{params[:action]}_job",
       "#{params[:controller]}_#{params[:action]}_job",
       "#{params[:controller]}_job",
      ].each do |job_name|
        job_class = job_name.classify.safe_constantize
        jobs << job_class if job_class
      end
      jobs.empty? ? [Noop] : jobs
    }
    @mutex = Mutex.new

  end

  def find_jobs(params)
    with_mutex do
      @jobs[{controller: params[:controller], action: params[:action]}]
    end
  end

  def self.find_jobs(params)
    instance.find_jobs params
  end

  private

  def with_mutex
    @mutex.synchronize { yield }
  end
end
