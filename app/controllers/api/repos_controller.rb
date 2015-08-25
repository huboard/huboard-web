module Api
  class ReposController < ApplicationController
    def show
      render json: { data: huboard.repo(params[:user], params[:repo]).fetch }
    end
    def issues
      render json: { data: huboard.repo(params[:user], params[:repo]).fetch_issues }
    end
    def board
      response = huboard.board(params[:user], params[:repo]).fetch
      render json: {data: response}
    end
  end
end
