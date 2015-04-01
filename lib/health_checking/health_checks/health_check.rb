module HealthChecking
  module HealthChecks
    module HealthCheck

      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods
        extend self

        def authorize!
          old_perform = class_method(:perform)
          class_eval do 
            define_singleton_method :perform do |*args|
              return old_perform.bind(self).call(args) if authorized
              {message: "Not Authorized"}
            end
          end
        end

        def weight(weight)
          @weight = weight
        end

        def authorization(authorization)
          @authorization = authorization
        end

        :private

          def authorized
            ##authorize based on the current authorization
          end
      end
    end
  end
end
