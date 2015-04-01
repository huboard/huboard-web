module HealthChecking
  module HealthChecks
    module HealthCheck

      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        extend self

        def weight(weight)
          @weight = weight
        end

        def authorization(authorization)
          @authorization = authorization
        end

        :private
          def authorized(deps)
            auth_levels = {
              all: 0,
              collaborator: 1,
              admin: 2
            }
            current = auth_levels[deps[:authorization]]
            required = auth_levels[@authorization]
            deps[:logged_in] && current >= required
          end
      end
    end
  end
end
