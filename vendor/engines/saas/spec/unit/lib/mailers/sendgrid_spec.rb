require 'spec_helper'

describe Saas::Mailers::Sendgrid do

  let(:sut) { Saas::Mailers::Sendgrid }
  let(:config) do
    {
      api_key: 'abc1234'
    }
  end

  context 'set configuration' do

    it 'is configurable' do
      adapter = sut.new(config)
      expect(adapter.api_key).to equal config[:api_key]
    end
  end

  context 'sending emails' do

    it 'sends emails' do

    end
  end
end
