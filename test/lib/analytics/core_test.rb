class Analytics::CoreTest < ActiveSupport::TestCase
  sut = Analytics::Core

  class FakeAnalytics; end

  test 'attach the underlying client' do
    sut.adapter = FakeAnalytics

    adapter = Analytics::Core.adapter
    assert adapter == FakeAnalytics
  end


  test 'identify and tie a user to their actions' do
    FakeAnalytics.stubs(:identify)
    sut.adapter = FakeAnalytics

    adapter = Analytics::Core.adapter
    adapter.expects(:identify).with({some: :payload})
    sut.identify({some: :payload})
  end

  test 'track a users to their actions through events' do
    FakeAnalytics.stubs(:track)
    sut.adapter = FakeAnalytics

    adapter = Analytics::Core.adapter
    adapter.expects(:track).with({some: :payload})
    sut.track({some: :payload})
  end

  test 'track page views from a user' do
    FakeAnalytics.stubs(:page)
    sut.adapter = FakeAnalytics

    adapter = Analytics::Core.adapter
    adapter.expects(:page).with({some: :payload})
    sut.page({some: :payload})
  end
end
