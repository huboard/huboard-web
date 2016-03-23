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
      template = board.issue_template
      decoded_template = template ? Base64.decode64(template['content']) : nil
      render json: { issue_template: decoded_template }
    end
  end
end
