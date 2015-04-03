require 'test_helper'

describe 'Autoload tests on exams' do
  describe HealthChecking::BoardExam do
    it 'autoloads the checks classes' do
      HealthChecking::BoardExam.new({}).checks
    end
  end
  describe HealthChecking::DashboardExam do
    it 'autoloads the checks classes' do
      HealthChecking::BoardExam.new({}).checks
    end
  end
end
