module HealthChecking
  module HealthChecks
   module HealthCheck

     def initialize(context={})
       @context = context
     end

     def check
       return not_authorized_payload unless authorized?
       perform(@context) ? pass_payload : fail_payload
     end

     def treatment
       return not_authorized_payload unless authorized?
       treat(@context) ? pass_payload : fail_payload
     end

     def authorized?
       auth_levels = {
         all: 0,
         collaborator: 1,
         admin: 2
       }
       current = auth_levels[@context[:authorization]]
       required = auth_levels[self._authorization]
       current >= required
     end

     def pass_payload
       {
         name: self._name,
         weight: self._weight,
         message: self._message || self._pass,
         success: true
       }
     end

     def fail_payload
       {
         name: self._name,
         weight: self._weight,
         message: self._message || self._fail,
         success: false
       }
     end

     def not_authorized_payload
       {
         name: self._name,
         weight: self._weight,
         message: 'Not Authorized',
         success: false
       }
     end

     def self.included(base)
       base.extend ClassMethods
       base.class_attribute :_weight
       base.class_attribute :_authorization
       base.class_attribute :_name
       base.class_attribute :_message
       base.class_attribute :_pass
       base.class_attribute :_fail
     end

     module ClassMethods
       extend self

       def weight(weight)
         self._weight = weight
       end

       def authorization(authorization)
         self._authorization = authorization
       end

       def name(name)
         self._name = name
       end

       def message(message)
         self._message = message
       end

       def passed(message)
         self._pass = message
       end

       def failed(message)
         self._fail = message
       end

     end
   end
  end
end
