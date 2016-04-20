module Api
  class ApiController < ApplicationController
    skip_before_action :check_account

    def logged_in
      if logged_in?
        return render json: {success: true}
      else
        return render json: {success: false, status: 403}
      end
    end
  end
end
