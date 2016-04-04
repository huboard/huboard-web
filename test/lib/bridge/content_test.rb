require 'test_helper'

class Huboard::ContentsTest < ActiveSupport::TestCase
  sut = Huboard::Contents

  class MockBridge
    include Huboard::Contents
  end
  bridge = MockBridge.new


  describe 'issue_template' do

    before(:each) do
      @mock_gh_instance = mock()
      bridge.stubs(:gh).returns(@mock_gh_instance)
    end

    describe 'the template exists' do
      file_list = [
        {'name' => 'ISSUE_TEMPLATE.txt', 'path' => 'ISSUE_TEMPLATE.txt'},
        {'name' => 'application.js'},
        {'name' => 'huboard_is_awesome.rb'}
      ]

      it 'looks for a template in the root of the repo' do
        @mock_gh_instance.expects(:contents).with('').returns file_list
        @mock_gh_instance.expects(:contents).with('ISSUE_TEMPLATE.txt').returns(file_list[0])
        @mock_gh_instance.expects(:contents).with('.github').never

        assert_equal file_list[0], bridge.issue_template
      end

      file_list_2 = [
        {'name' => '.github'},
        {'name' => 'application.js'},
        {'name' => 'huboard_is_awesome.rb'}
      ]

      it 'looks for a template in the .github directory' do
        @mock_gh_instance.expects(:contents).with('').returns file_list_2
        @mock_gh_instance.expects(:contents).with('.github').returns file_list
        @mock_gh_instance.expects(:contents).with('ISSUE_TEMPLATE.txt').returns(file_list[0])

        assert_equal file_list[0], bridge.issue_template
      end
    end

    describe 'the template does not exist' do
      file_list = [
        {'name' => 'NO_ISSUE_TEMPLATE.txt'},
        {'name' => 'application.js'},
        {'name' => 'huboard_is_awesome.rb'}
      ]

      it 'it returns nil' do
        @mock_gh_instance.expects(:contents).with('').returns file_list

        assert_equal nil, bridge.issue_template
      end
    end

    describe 'the repository is empty' do
      file_list = {"message" => "This repository is empty."}

      it 'it returns nil' do
        @mock_gh_instance.expects(:contents).with('').returns file_list
        @mock_gh_instance.expects(:contents).with('.github').never

        assert_equal nil, bridge.issue_template
      end
    end
  end

  describe 'issue template content' do

    before(:each) do
      @content = '#Guidelines ##For ###Awesomeness'
      @encoded_content = Base64.encode64(@content)
    end

    describe 'a template exists' do
      it 'returns the decoded content' do
        bridge.stubs(:issue_template).returns({
          'content' => @encoded_content
        })

        assert_equal @content, bridge.issue_template_content
      end
    end

    describe 'a template does not exist' do
      it 'is nil' do
        bridge.stubs(:issue_template).returns(nil)

        assert_equal nil, bridge.issue_template_content
      end
    end
  end

  describe 'issue template pattern' do
    pattern = sut::ISSUE_TEMPLATE_PATTERN

    it 'matches .txt' do
      file_name = 'ISSUE_TEMPLATE.txt'
      assert_match pattern, file_name
    end

    it 'matches .md' do
      file_name = 'ISSUE_TEMPLATE.md'
      assert_match pattern, file_name
    end

    it 'is case insensitive' do
      file_name = 'IsSUe_tEMpLAtE.md'
      assert_match pattern, file_name
    end

    it 'does not match' do
      file_name = 'OTHER_FILE.md'
      assert file_name !~ pattern

      file_name = 'OTHER_FILE.txt'
      assert file_name !~ pattern

      file_name = 'ISSUE_TEMPLATE_PLUS.txt'
      assert file_name !~ pattern

      file_name = 'NO_ISSUE_TEMPLATE.txt'
      assert file_name !~ pattern

      file_name = 'ISSUE_TEMPLATE.md5'
      assert file_name !~ pattern
    end
  end
end
