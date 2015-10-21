module InflectionsHelper
  String.class_eval do
    def present_tense
      PastTenseInflections.get(self)
    end
  end

  class PastTenseInflections
    def self.get(key)
      @@keys[key]
    end
    @@keys = {
      'opened' => 'open',
      'reopened' => 'reopen',
      'closed' => 'close',
      'labeled' => 'label',
      'unlabeled' => 'unlabel'
    }
  end
end
