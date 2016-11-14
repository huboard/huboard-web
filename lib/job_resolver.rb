class JobResolver
  include Singleton
  class Noop
    def self.perform_later(*args)
      self
    end
    def self.set(*args)
      self
    end
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

    @events = UberDictionary.new ->(params) {
      [
       "saas/app/#{params[:type].pluralize}_#{params[:action]}_#{params[:type]}_job",
       "saas/api/#{params[:type].pluralize}_#{params[:action]}_#{params[:type]}_job",
       "api/#{params[:type].pluralize}_#{params[:action]}_#{params[:type]}_job",
       "api/#{params[:type].pluralize}_#{params[:action]}_job",
       "api/#{params[:type].pluralize}_edit_issue_job",
      ].each do |job_name|
        job_class = job_name.classify.safe_constantize
        return job_class if job_class
      end
      return Noop
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

  def find_event(type, action)
    with_mutex do
      @events[{type: type, action: action}]
    end
  end

  def self.find_event(type, action)
    instance.find_event type, action
  end

  private

  def with_mutex
    @mutex.synchronize { yield }
  end
end
