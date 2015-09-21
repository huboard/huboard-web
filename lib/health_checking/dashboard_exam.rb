module HealthChecking
  class DashboardExam

    attr_reader :deps
    def initialize(deps)
      @deps = deps
    end

    def checks
      @@checks
    end

    def treatments
      []
    end

    @@checks = [
      #Checks for the dashboard
    ]
    
  end
end
