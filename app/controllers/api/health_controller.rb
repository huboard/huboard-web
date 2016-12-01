module Api
  class HealthController < ApiController
    def board
      board = huboard.board(params[:user], params[:repo])
      exam = HealthChecking::BoardExam.new({
        board: board,
        hooks: board.hooks,
        authorization: authorization_level,
        logged_in: logged_in? })
      payload = HealthChecking::Doctor.new(exam).check
      render json: {data: payload}
    end
    def treat_board
      board = huboard.board(params[:user], params[:repo])
      exam = HealthChecking::BoardExam.new({
        board: board,
        hooks: board.hooks,
        names: params[:names],
        authorization: authorization_level,
        logged_in: logged_in? })
      payload = HealthChecking::Doctor.new(exam).treat
      render json: {data: payload}
    end
  end
end
