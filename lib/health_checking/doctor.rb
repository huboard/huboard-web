module HealthChecking
  class Doctor

    attr_reader :exam, :payload
    def initialize(exam)
      @payload = []
      @exam = exam 
    end

    def check
      checks.each do |check_klass|
        @current_check = check_klass.new
        @payload << not_authorized_payload && next if !authorized
        @payload << (@current_check.perform(@exam.deps) ?
          pass_payload : fail_payload)
      end
      @payload
    end

    def treat
      @exam.treatments.each do |treatment_klass|
        @current_check = treatment_klass.new
        @payload << not_authorized_payload && next if !authorized
        @payload << (@current_check.treat(@exam.deps) ?
          pass_payload : fail_payload)
      end
      @payload
    end

    def check_only(health_check)
      @current_check = health_check.to_s.classify.constantize.new
      return @payload << not_authorized_payload if !authorized
      @payload << (@current_check.perform(@exam.deps) ?
        pass_payload : fail_payload)
      @payload
    end

    def checks
      @exam.checks
    end

    :private

      def authorized
        auth_levels = {
          all: 0,
          collaborator: 1,
          admin: 2
        }
        current = auth_levels[@exam.deps[:authorization]]
        required = auth_levels[@current_check._authorization]
        current >= required
      end

      def pass_payload
        {
          name: @current_check._name,
          weight: @current_check._weight,
          message: @current_check._message || @current_check._pass,
          success: true
        }
      end

      def fail_payload
        {
          name: @current_check._name,
          weight: @current_check._weight,
          message: @current_check._message || @current_check._fail,
          success: false
        }
      end

      def not_authorized_payload
        {
          name: @current_check._name,
          weight: @current_check._weight,
          message: 'Not Authorized',
          success: false
        }
      end
  end
end
