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
        @exam.deps[:logged_in] && current >= required
      end

      def pass_payload
        "PASS"
      end

      def fail_payload
        "FAIL"
      end

      def not_authorized_payload
        "NOT AUTHORIZED"
      end
  end
end
