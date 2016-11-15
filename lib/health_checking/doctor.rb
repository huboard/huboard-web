module HealthChecking
  class Doctor

    attr_reader :exam, :payload
    def initialize(exam)
      @payload = []
      @exam = exam 
    end

    def check
      checks.each do |check_klass|
        @current_check = check_klass.new @exam.deps
        @payload << @current_check.check
      end
      @payload.flatten
    end

    def treat
      @exam.treatments.each do |treatment_klass|
        @current_check = treatment_klass.new @exam.deps
        @payload << @current_check.treatment
      end
      @payload.flatten
    end

    def checks
      @exam.checks
    end

  end
end
