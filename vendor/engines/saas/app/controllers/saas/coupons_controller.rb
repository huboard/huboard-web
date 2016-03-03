module Saas
  class CouponsController < Saas::ApplicationController
    def valid
      begin
        Stripe::Coupon.retrieve(params[:coupon_id])
        head :ok
      rescue => e
        render json: e.json_body, status: 422
      end
    end
    def redeem
      query = Queries::CouchCustomer.get_cust(params[:id], couch)
      doc = QueryHandler.exec(&query)
      return render json: {success: false, message: "Couldn't find couch record: #{params[:id]}"} unless doc

      begin
        customer = Stripe::Customer.retrieve(params[:id])
        customer.coupon = params[:coupon]
        response = customer.save

        doc.stripe.customer.discount = customer.discount
        couch.customers.save doc

        render json: response 
      rescue Stripe::InvalidRequestError => e
        render json: e.json_body, status: 422
      end
    end
  end
end
