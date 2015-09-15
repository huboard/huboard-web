module Api
  class BoardController < ApplicationController

    def commits
      render json: huboard.board(params[:user], params[:repo]).commits
    end

    def commit
      render json: huboard.board(params[:user], params[:repo]).commit(params[:commit])
    end

  end
end
