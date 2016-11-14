module ActiveSupport
  module Inflector
    extend self
    def present_tense(word)
      keys = {
        'opened'     => 'open',
        'reopened'   => 'reopen',
        'closed'     => 'close',
        'labeled'    => 'label',
        'unlabeled'  => 'unlabel',
        'assigned'   => 'assign',
        'unassigned' => 'unassign',
        'edited'     => 'edit',
        'milestoned' => 'milestone',
        'demilestoned' => 'milestone',
      }
      keys[word]
    end
  end
end
class String
  def present_tense
    ActiveSupport::Inflector.present_tense(self) || self
  end
end
