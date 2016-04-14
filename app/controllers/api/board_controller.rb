module Api
  class BoardController < ApiController

    def commits
      render json: huboard.board(params[:user], params[:repo]).commits
    end

    def commit
      render json: huboard.board(params[:user], params[:repo]).commit(params[:commit])
    end

    def issue_template
      board = huboard.board(params[:user], params[:repo])
      template_content = board.issue_template_content
      render json: { issue_template: template_content }
    end
  end
end
