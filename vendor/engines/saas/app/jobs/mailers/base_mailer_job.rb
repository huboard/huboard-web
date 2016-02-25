module Mailers
  class BaseMailerJob < ActiveJob::Base
    include ::ApplicationHelper

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
      template = self.class.instance_variable_get('@template')
      doc = couch.users.get(params).body

      if not doc.emails_sent[template]
        mailer.send_mail({
          to: params['email'],
          from: self.class.instance_variable_get('@from'),
          subject: self.class.instance_variable_get('@subject'),
          text: self.class.instance_variable_get('@text'),
          html: self.class.instance_variable_get('@html'),
          template: template
        })
        doc.emails_sent[template] = Time.now
        couch.users.save doc
      end
    end
  end
end
