module Enterprise
  class ErrorsController < Enterprise::ApplicationController
    layout false
    def unauthenticated_enterprise
      respond_to do |format|
        format.html { redirect_to "/setup/start", status: 403}
        format.json { render json: { error: "Unauthenticated" }, status: 403}
      end
    end
  end
end

