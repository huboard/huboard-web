require 'test_helper'

class Api::HealthControllerTest < ActionController::TestCase

  #One of the hazards of relying too heavily on helpers..
  Api::HealthController.class_eval do
    def huboard
      board = Object.new()
      board.class_eval do
        def board(user, repo)
          self
        end
        def hooks; end
      end
      board
    end
    def authorization_level; end
    def logged_in?; end
  end

  test 'board' do
    #Setup
    payload = [{
      'name' => 'some_health_check',
      'success'=> true
    }]
    mock_doctor = mock('Doctor Instance')
    mock_doctor.stubs(:check).returns(payload)

    HealthChecking::BoardExam.stubs(:new)
    HealthChecking::Doctor.stubs(:new).returns(mock_doctor)

    #Run
    get :board, user: 'test_user', repo: 'test_repo'

    #Assert
    assert_response :success
    assert_equal({'data' => payload}, JSON.parse(response.body))
  end
end
