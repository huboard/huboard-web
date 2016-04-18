class ErrorsController < ApplicationController
  layout false
  after_action :track_exception, only: [:unprocessable_entity, :server_error]
  def unauthenticated
    respond_to do |format|
      format.html {render :unauthenticated, status: 403}
      format.json { render json: { error: "Unauthenticated" }, status: 403}
    end
  end
  def not_found
    respond_to do |format|
      format.html {render [:not_found, :not_found_b].sample, status: 404}
      format.json { render json: { error: "Not found" }, status: 404}
    end
  end
  def unprocessable_entity
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html { render :server_error, status: 422 }
      format.json { render json: { status: 422, error: @exception.message, message: @exception.message}, status: 422  }
    end
  end
  def server_error
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html {render :server_error, status: 500 }
      format.json { render json: { status: 500, error: @exception.message, message: @exception.message}, status: 500  }
    end
  end

  def track_exception
    exception = env["action_dispatch.exception"]
    ::Raygun.track_exception(exception, custom_data: {generated_by: 'Faraday::Response::RaiseGheeError'})
  end
end
