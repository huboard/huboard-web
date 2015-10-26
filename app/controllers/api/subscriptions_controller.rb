module Api
  class SubscriptionsController < ApiController

    def show
      if gh.repos("#{params[:user]}/#{params[:repo]}").raw.status != 404
        channel = "/#{params[:user]}/#{params[:repo]}".downcase.gsub(".","!")
        subscription = PrivatePub.subscription channel: channel
        render json: subscription
      else
        render json: {error: "Unauthorized access to repository"}, status: 403
      end
    end
  end
end
