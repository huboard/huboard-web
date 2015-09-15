module Api
  class ReposController < ApplicationController
    def show
      render json: { data: huboard.repo(params[:user], params[:repo]).fetch }
    end
    def details
      render json: { data: huboard.repo(params[:user], params[:repo]).details }
    end
  end
end
