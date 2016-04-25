require 'test_helper'

class StringExtensionTest < ActiveSupport::TestCase
  test 'string#present_tense should exist' do
    assert "".respond_to? :present_tense
  end

  test 'string#present_tense converts our words' do
    assert "opened".present_tense == "open"
    assert "reopened".present_tense == "reopen"
    assert "closed".present_tense == "close"
    assert "labeled".present_tense == "label"
    assert "unlabeled".present_tense == "unlabel"
    assert "assigned".present_tense == "assign"
    assert "unassigned".present_tense == "unassign"
    assert "edited".present_tense == "edit"
  end

end
