class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  rescue_from ActionController::InvalidAuthenticityToken, :with => :csrf_failed
  rescue_from Ghee::Unauthorized, :with => :ghee_unauthorized
  rescue_from Ghee::NotFound, :with => :ghee_not_found

  include ApplicationHelper

  after_action :queue_job

  protected
  def ghee_not_found
    render({ json: {error: 'Not Found'}, status: 404 })
  end
  def ghee_unauthorized
    respond_to do |format|
      format.json { render json: {error: 'GitHub token is expired'}, status: 422}
      format.html do
        #only logout if html
        request.env['warden'].logout

        redirect_to '/login/github' 
      end
    end
  end
  def csrf_failed
    respond_to do |format|
      format.html { render :server_error, status: 422 }
      format.json { render json: { status: 422, error: "CSRF token is expired", message:"CSRF token is expired" }, status: 422  }
    end
  end
  def queue_job
    instance_variable_names = self.instance_variable_names.reject do |name|
      name.start_with? "@_"
    end

    instance_variable_names = instance_variable_names.reject do |name|
      self.protected_methods.any? {|method| method.to_s.delete("?!") == name.delete("@?!")}
    end

    job_params = instance_variable_names.reduce(HashWithIndifferentAccess.new) do  |hash, name| 
      hash[name.delete("@")] = self.instance_variable_get name 
      hash
    end

    job_params['current_user'] = (current_user.attribs || {}).to_h
    job_params['action_controller.params'] = params
    job_params['session_id'] = session['guid']

    #TODO: make sure you can safely serialize the params
    JobResolver.find_jobs(params).each do |job|
      job.perform_later job_params
    end
  end

  def not_found
    raise ActionController::RoutingError.new 'Not found'
  end
end
