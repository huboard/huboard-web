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

    describe 'a template call throws' do
      it 'is nil' do
        bridge.stubs(:issue_template).throws("Exception")
        Raygun.expects(:track_exception).once

        assert_equal nil, bridge.issue_template_content
      end
    end

    describe 'The content string decodes to ascii' do
      it 'force encodes an ascii string' do
        ascii= 'IyBVc2VyIHN0b3J5CgoqKkNvbW8qKgoqKmV1IHF1ZXJvKiogCioqcGFyYSBx
        dWUqKgoKIyBRQQoKIyMgQ2Vuw6FyaW86IAoqKkRhZG8qKiAKKipRdWFuZG8q
        KgoqKkVudMOjbyoqIAoKIyBLZXkgcXVlc3Rpb25zCgoqKlE6KiogV2hhdCBp
        cyBzdGF0aWMgb24gdGhlIHNjcmVlbj8KKipSOioqCgoqKlE6KiogV2hhdCBp
        cyBkeW5hbWljIG9uIHRoZSBzY3JlZW4/CioqUjoqKgoKKipROioqIFdoZXJl
        IGNhbiBJIGNsaWNrIG9uIHRoaXMgc2NyZWVuPwoqKlI6KioKCioqUToqKiBX
        aGljaCB2aWV3cyBjYW4gaGlkZS9zaG93L2NoYW5nZT8KKipSOioqCgoKIyBS
        ZWZlcsOqbmNpYXMKCiMjIENoZWNrbGlzdDoKICAtIFsgXQoKIyMgRGVmaW5p
        dG9uIG9mIERvbmU6CiAgLSBbIF0KCiMjIERvY3VtZW50cwoqIFtNUFRdKGh0
        dHBzOi8vZG9jcy5nb29nbGUuY29tL3NwcmVhZHNoZWV0cy9kLzFpV21HTExW
        TFk3aW1fb29kczNFZF83c1lXUTVydkR4Rmg4dk5kR1I5SDJnL2VkaXQjZ2lk
        PTIwMzY4NjcwNjMpCiogW1Njb3BlXShodHRwczovL2RvY3MuZ29vZ2xlLmNv
        bS9kb2N1bWVudC9kLzE2MHd5NmI2VjZORE5XeUMyZmpzZGlvenhxbFk1aDQy
        MFJJdnVVZzJvbXp3L2VkaXQpCiogW0ludmlzaW9uXShodHRwczovL3Byb2pl
        Y3RzLmludmlzaW9uYXBwLmNvbS9kL21haW4vZGVmYXVsdC8jL3Byb2plY3Rz
        LzYyNjY2MTgpCiogW0FwaWFyeV0oaHR0cDovL2RvY3Mud2Vic2VydmljZXBv
        c3RoYXVzY29tLmFwaWFyeS5pby8jKQoKIyMgT2JzZXJ2YXRpb25zCg=='

        bridge.stubs(:issue_template).returns({
          'content' => ascii
        })

        result = bridge.issue_template_content
        assert_equal Encoding::UTF_8, result.encoding
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
