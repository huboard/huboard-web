module Api
  class WebhooksController < ApiController
    skip_before_action :verify_authenticity_token

    def hooks
      render json: {
        hooks: gh.repos(params[:user],params[:repo]).hooks
      }
    end

    def legacy
      render json: { message: "Webhook received" }
    end

    def publish_pull_request_event
      return render json: { message: "pong" } if request.env["HTTP_X_GITHUB_EVENT"] == "ping"

      payload = HashWithIndifferentAccess.new JSON.parse(params[:payload])
      return render json: { message: "Fail to parse message" } if payload[:pull_request].nil?

      #guard against the syncronize action
      return render json: { message: "Not implemented: `synchronize` event" } if payload[:action] == "synchronize"

      repo = {
        repo: {
          owner: { login: payload[:repository][:owner][:login] },
          name: payload[:repository][:name],
          full_name: payload[:repository][:full_name]
        }
      }
      payload[:pull_request].extend(Huboard::Issues::Card).merge!(repo)

      message = HashWithIndifferentAccess.new(
        :pull_request => true,
        :issue => payload[:pull_request],
        :label => payload[:label],
        :assignee => payload[:assignee],
        "action_controller.params" => {},
        :current_user => payload[:sender]
      )

      is_column = Huboard.column_pattern
      if payload[:label] && !!payload[:label][:name].match(is_column)
        return render json: { message: "Webhook received" }
      end

      generate_issue_event(payload[:action], message)
      render json: { message: "Webhook received" }
    end


    def publish_issue_event
      return render json: { message: "pong" } if request.env["HTTP_X_GITHUB_EVENT"] == "ping"

      payload = HashWithIndifferentAccess.new JSON.parse(params[:payload])
      return render json: { message: "Fail to parse message" } if payload[:issue].nil?

      repo = {
        repo: {
          owner: { login: payload[:repository][:owner][:login] },
          name: payload[:repository][:name],
          full_name: payload[:repository][:full_name]
        }
      }
      payload[:issue].extend(Huboard::Issues::Card).merge!(repo)

      message = HashWithIndifferentAccess.new(
        :issue => payload[:issue],
        :label => payload[:label],
        :assignee => payload[:assignee],
        "action_controller.params" => {},
        :current_user => payload[:sender]
      )

      is_column = Huboard.column_pattern
      if payload[:label] && !!payload[:label][:name].match(is_column)
        return render json: { message: "Webhook received" }
      end

      generate_issue_event(payload[:action], message)
      render json: { message: "Webhook received" }
    end

    #Putting this one on the backburner for now...
    def log_comment
      render json: { message: "Webhook received" }
    end

    def stripe
      return render json: { message: "Not Authorized" } unless params[:stripe_token] == ENV["STRIPE_WEBHOOK_TOKEN"]

      payload = Hashie::Mash.new(params)
      id = payload.data.object.customer

      query = Queries::CouchCustomer.get_cust(id, couch)
      plan_doc = QueryHandler.exec(&query)
      return render json: { message: "Webhook received" } unless plan_doc && plan_doc.id == id

      if payload.type == "customer.subscription.updated" || payload.type == "customer.subscription.deleted"
        plan_doc.trial = "expired" if payload.data.object.status != "trialing"

        customer = plan_doc.stripe.customer
        customer.subscriptions.data[0] = payload.data.object
        couch.customers.save plan_doc
      end

      if payload.type == "invoice.payment_succeeded"
        customer = Stripe::Customer.retrieve(plan_doc.id)
        plan_doc.stripe.customer = customer
        couch.customers.save plan_doc
      end

      render json: { message: "Webhook received" }
    end

  end
end
