module Api
  class SubscriptionsController < ApplicationController
    def show
      if gh.repos("#{params[:user]}/#{params[:repo]}").raw.status != 404
        subscription = PrivatePub.subscription channel: "/#{params[:user]}/#{params[:repo]}".downcase
        render json: subscription
      else
        render json: {error: "Unauthorized access to repository"}, status: 403
      end
    end
  end
end
