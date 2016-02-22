require 'spec_helper'

describe Saas::Mailer do

  class SomeEmailAdapter; end

  let(:mailer) { Saas::Mailer.new }
  let(:adapter) { SomeEmailAdapter.new }

  context 'Setting up the mailer' do

    it 'has an adapter' do
      mailer.adapter = adapter
      expect(mailer.adapter).to equal(adapter)
    end
  end

  context 'sending mail' do

    let(:mail){ {subject: "Hu", body: "Dat"} }

    before :each do
      mailer.adapter = adapter
    end

    it 'should send mail' do
      expect(mailer.adapter).to receive(:send_mail).with(mail)
      mailer.send_mail(mail)
    end
  end
end
