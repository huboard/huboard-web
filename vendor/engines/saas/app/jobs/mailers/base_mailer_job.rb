module Mailers
  class BaseMailerJob < ActiveJob::Base

    def mailer
      return Rails.configuration.mailer
    end

    def self.template(template)
      @template = template
    end

    def self.subject(subject)
      @subject = subject
    end

    def self.text(text)
      @text = text 
    end

    def self.html(html)
      @html = html
    end

    def self.from(from)
      @from = from
    end

    def perform(params)
      mailer.send_mail({
        to: params['email'],
        from: self.class.instance_variable_get('@from'),
        subject: self.class.instance_variable_get('@subject'),
        text: self.class.instance_variable_get('@text'),
        html: self.class.instance_variable_get('@html'),
        template: self.class.instance_variable_get('@template')
      })
    end
  end
end
