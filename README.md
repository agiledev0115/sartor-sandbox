# Cezerin - Sartor Backend.

The Sartor Backend Web Application.

This consists of two parts 

1. [A Cezerin3 project Link](https://github.com/Cezerin3/Store)
2. Sartor Backend

To get all information about Cezerin3 read the Github [Project](https://github.com/Cezerin3/Store) documentation.

## Cezerin-Sartor Platform:

1. Cezerin API - Backend.
2. Cezerin Store - Frontend.
3. Cezerin Admin - Dashboard.
4. Cezerin Client - JavaScript client for Cezerin REST API.
5. Sartor Backend in Cezerin Store Server.

## Application Structure

Make sure run the application in Node v12.

```
.
├── config                   # Project and build configurations
|   └── auth                 # Sartor auth config
|   └── passport             # Sartor passport config
├── dist                     # Distribution folder
├── locales                  # Text files
├── logs                     # Log files
├── public                   # Static public assets and uploads
│   ├── admin                # Dashboard index.html
│   ├── admin-assets         # Dashboard assets
│   ├── content              # Store root folder
|   └── sator                # Sartor assets
|
├── scripts                  # Shell scripts for theme install/export
├── src                      # Application source code
│   ├── admin                # Dashboard application
│   │   └── client           # Client side code
│   ├── api                  # REST API
│   │   └── server           # Server side code
│   └── store                # Store application
│       ├── client           # Client side code
│       ├── server           # Server side code
|       |   └── controllers  # Sartor controllers
|       |   └── dal          # Sartor data access layer
|       |   └── lib          # Sartor libs
|       |   └── models       # Sartor models
|       |   └── routes       # Sartor routes
|       |   └── api.js       # Routes for Store and Sartor
|       |   └── index.js     # App entrypoint for Store and Sartor
│       └── shared           # Universal code
│           └── views        # Sartor template views    
│
├── theme                    # Theme as a local package
└── process.json             # pm2 process file
```

## Roadmap

* **Things to implement**
    * Add a product fix. ✅
    * Make blog editable. ✅
    * What needs to be fixed on the admin dashboard: ✅
        * Side bar. ✅
        * Making current tab active. ✅
    * Navbar:
        * Make bell notification icon show orders notification. ✅
        * Make mail notification icon show chat notification.
    * Dashboard page:
        * List the top 4SELLING PRODUCT with the number of likes(hits)
        * Show number of Brand followers.
        * Showband monthly sale.
        * Show brand yearly sales.
        * Show brand milestone, this milestone is a set of questions asked for brands when setting up their profile to gauge their progress. 
        * List numbers of invoices of the brand that has opened.
        * Show order activities.
        * Show, where brand customers are coming from by geolocation this information, will be coming from customer address information.
        * List the top 5 customers of the brand by how many orders they brought from the brand by dollar value.
        * List order status if they are still pending or closed, when brands want to list the full orders they have on this page redirect them to the order page.
        * List brand best performing image post by numbers of likes and comment.
    * Customer section: ✅
        * This section stores all the customers that have ordered from this brand and their current and past invoice ✅
        * On the action, tab brands can open up their customer information and delete. ✅
    * Customer data information section:
        * On the tag, section brands can give tags to this customer's what the tags are are left up to the brands to decide. ✅
        * List number of orders this cutomer has ordered from the brand. ✅
        * Give the number of discounts (but right now it as to be 0 because the discount has yet to be implemented. ✅
        * Give the number of reviews customer has given to this brand. ✅
        * Give the number of returns this customer has returned to this brand. ✅
        * Give the number of orders by dollars this customer has brought from this brand. ✅
        * On the message tab brand to open a direct message to the customer.
        * Give order timeline. ✅
        * Give all invoice order of the customer. ✅
        * List top item brought by cutomer from brand. ✅
    * Order page: ✅
        * On the add new, brands can create an invoice for external customers that are not on sartor for logging and keeping track of their other customers outside of sartor. ✅
        * Make order searchable. ✅
        * List brand orders information as shown on the table. ✅
        * Make order number clickable with then links to order invoice. ✅
        * On the action, table brands can open the order invoice and delete the order, if the brand deletes the order do not delete it from the database just make it invisible to the brand. ✅
    * Invoice page: ✅
        * Show customer image. ✅
        * The message is a message sent to the customer after they have ordered from this brand, this message is set by brands if a brand has not set one let the admin set a default message. ✅
        * Just because the customer brought multiple orders from the different brands doesn't mean the invoice will contain for an item brought from brand B will show up in brand A invoice. ✅
        * In the Order Status brand can set if the Fulfilled or retuned by default it should be pending if no action has been taken on the order. ✅
        * Customer Body measurement section of the invoice is where the body measurement information of the customer will be stored, this information will be sent when our Technology get implemented into the app. ✅
        * When the brand has Fulfilled the order tracking number for the order will be added to show customers where their order is at. ✅
    * Note section:
        * Brands can add a note on this invoice for their reference.
        * When submitted update the order status on the order table.
    * Product section: ✅
        * Not much need to fix here, make product store set to brand store, don't make them type their brand name it can become redundant. ✅
        * Not all image uploads shows in the preview, plz make all 7 images how on the preview. ✅
        * Add a section for an uploading product video, this up for brands to upload the video. ✅
    * Brand profile/OJA CONNECT (Plan to make this page a place where the brand can connect with distributors in the future). These two go together just like how you would post on Facebook this applies to the admin dashboard and the on the app the post will be displayed like an Instagram feed: 
        *  Gallery area: is the brand image's to be posted or video will be stored at, also think of how you can only post images & 30sec max video on Instagram, images can be slider-type images that contain multiple images and a video. Keep in mind this Gallery images will be used on the Andriod app brand profile page.
        * Feed:
            * Contains what brand has been posting along with the comment and likes on the post, brands should be able to post a reply to comment.

            This is how it be will be on the admin dasboard.

            ![This is how it be will be on the admin dasboard](https://i.ibb.co/Xjmz29D/Untitled1.jpg)
        

            Then it get converted to this for the andriod app both fecting from same data.

            ![Then it get converted to this for the andriod app both fecting from same data](https://i.ibb.co/1Q78myN/Untitled2.jpg)

    * Followers:
        * Only show the customers following this brand from the APP, plz do not confuse this follower with the internal brands that are following this brand straight from the admin dashboard.
    * Profile:
        * Brand should be able to change the logo and edit about us section.
    * Suggested Brands to follow:
        * Show other internal brands on the platform that this brand can follow.
    * Brand Showcase video:
        * Is a brand intro video that tells brand customers who this brand is, this will then be displayed on the app.
    * Brands following this brand:
        * Only other internal brands that follow this brand should show up here. 
