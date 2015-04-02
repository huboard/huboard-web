module HealthChecking
  class Doctor

    attr_reader :exam, :payload
    def initialize(exam)
      @payload = []
      @exam = exam 
    end

    def check
      checks.each do |check|
        @payload << check.new.perform(@exam.deps)
      end
      @payload
    end

    def checks
      @exam.checks
    end
  end
end
