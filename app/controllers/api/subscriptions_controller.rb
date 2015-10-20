module Api
  class SubscriptionsController < ApplicationController
    def show
      subscription = PrivatePub.subscription channel: "/#{params[:user]}/#{params[:repo]}".downcase
      render json: subscription
    end
  end
end
