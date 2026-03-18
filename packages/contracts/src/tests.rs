#![cfg(test)]

use stellar_contract_sdk::{Env, Address, BigInt, String};
use crate::{MuseContract, MuseError, Artwork, Listing, Offer};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();

    // Test successful initialization
    assert_eq!(client.initialize(&env), Ok(()));
    
    // Test duplicate initialization
    assert_eq!(client.initialize(&env), Err(MuseError::Unauthorized));
}

#[test]
fn test_create_artwork() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();
    
    // Initialize contract
    client.initialize(&env).unwrap();
    
    let creator = Address::generate(&env);
    let title = String::from_str(&env, "AI Artwork #1");
    let description = String::from_str(&env, "Generated with AI Model");
    let image_url = String::from_str(&env, "https://example.com/image1.jpg");
    let prompt = String::from_str(&env, "A futuristic cityscape");
    let ai_model = String::from_str(&env, "Stable Diffusion v2.1");
    let price = BigInt::from_u64(&env, 10000000); // 0.1 XLM (assuming 7 decimals)
    let royalty_bps = 500; // 5%

    let artwork_id = client.create_artwork(
        &env,
        &creator,
        &title,
        &description,
        &image_url,
        &prompt,
        &ai_model,
        &price,
        royalty_bps,
    ).unwrap();

    assert_eq!(artwork_id, 1);

    // Verify artwork was created
    let artwork = client.get_artwork(&env, artwork_id).unwrap();
    assert_eq!(artwork.id, artwork_id);
    assert_eq!(artwork.creator, creator);
    assert_eq!(artwork.title, title);
    assert_eq!(artwork.price, price);
    assert_eq!(artwork.royalty_bps, royalty_bps);
}

#[test]
fn test_royalty_validation() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();
    
    client.initialize(&env).unwrap();
    
    let creator = Address::generate(&env);
    let title = String::from_str(&env, "AI Artwork #1");
    let description = String::from_str(&env, "Generated with AI Model");
    let image_url = String::from_str(&env, "https://example.com/image1.jpg");
    let prompt = String::from_str(&env, "A futuristic cityscape");
    let ai_model = String::from_str(&env, "Stable Diffusion v2.1");
    let price = BigInt::from_u64(&env, 10000000);
    let royalty_bps = 1500; // 15% - exceeds max

    let result = client.create_artwork(
        &env,
        &creator,
        &title,
        &description,
        &image_url,
        &prompt,
        &ai_model,
        &price,
        royalty_bps,
    );

    assert_eq!(result, Err(MuseError::RoyaltyTooHigh));
}

#[test]
fn test_list_artwork() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();
    
    client.initialize(&env).unwrap();
    
    let creator = Address::generate(&env);
    let title = String::from_str(&env, "AI Artwork #1");
    let description = String::from_str(&env, "Generated with AI Model");
    let image_url = String::from_str(&env, "https://example.com/image1.jpg");
    let prompt = String::from_str(&env, "A futuristic cityscape");
    let ai_model = String::from_str(&env, "Stable Diffusion v2.1");
    let price = BigInt::from_u64(&env, 10000000);
    let royalty_bps = 500;

    let artwork_id = client.create_artwork(
        &env,
        &creator,
        &title,
        &description,
        &image_url,
        &prompt,
        &ai_model,
        &price,
        royalty_bps,
    ).unwrap();

    let list_price = BigInt::from_u64(&env, 15000000); // 0.15 XLM
    let duration = 86400; // 24 hours

    let listing_id = client.list_artwork(
        &env,
        &creator,
        artwork_id,
        &list_price,
        duration,
    ).unwrap();

    assert_eq!(listing_id, 2); // Should be 2 since we used counter for artwork ID 1

    // Verify listing was created
    let active_listings = client.get_active_listings(&env);
    assert_eq!(active_listings.len(), 1);
    
    let listing = active_listings.get(0).unwrap();
    assert_eq!(listing.artwork_id, artwork_id);
    assert_eq!(listing.seller, creator);
    assert_eq!(listing.price, list_price);
    assert!(listing.active);
}

#[test]
fn test_make_offer() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();
    
    client.initialize(&env).unwrap();
    
    let creator = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    // Create artwork
    let artwork_id = client.create_artwork(
        &env,
        &creator,
        &String::from_str(&env, "AI Artwork #1"),
        &String::from_str(&env, "Generated with AI Model"),
        &String::from_str(&env, "https://example.com/image1.jpg"),
        &String::from_str(&env, "A futuristic cityscape"),
        &String::from_str(&env, "Stable Diffusion v2.1"),
        &BigInt::from_u64(&env, 10000000),
        500,
    ).unwrap();

    // List artwork
    let listing_id = client.list_artwork(
        &env,
        &creator,
        artwork_id,
        &BigInt::from_u64(&env, 15000000),
        86400,
    ).unwrap();

    // Make offer
    let offer_amount = BigInt::from_u64(&env, 12000000); // 0.12 XLM
    let offer_duration = 3600; // 1 hour

    let offer_id = client.make_offer(
        &env,
        &buyer,
        listing_id,
        &offer_amount,
        offer_duration,
    ).unwrap();

    assert_eq!(offer_id, 3); // Next counter value

    // Verify offer was created
    let offers = client.get_listing_offers(&env, listing_id);
    assert_eq!(offers.len(), 1);
    
    let offer = offers.get(0).unwrap();
    assert_eq!(offer.listing_id, listing_id);
    assert_eq!(offer.offeror, buyer);
    assert_eq!(offer.amount, offer_amount);
    assert!(offer.active);
}

#[test]
fn test_unauthorized_listing() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MuseContract);
    let client = contract_id.client();
    
    client.initialize(&env).unwrap();
    
    let creator = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);
    
    // Create artwork
    let artwork_id = client.create_artwork(
        &env,
        &creator,
        &String::from_str(&env, "AI Artwork #1"),
        &String::from_str(&env, "Generated with AI Model"),
        &String::from_str(&env, "https://example.com/image1.jpg"),
        &String::from_str(&env, "A futuristic cityscape"),
        &String::from_str(&env, "Stable Diffusion v2.1"),
        &BigInt::from_u64(&env, 10000000),
        500,
    ).unwrap();

    // Try to list with unauthorized user
    let result = client.list_artwork(
        &env,
        &unauthorized_user,
        artwork_id,
        &BigInt::from_u64(&env, 15000000),
        86400,
    );

    assert_eq!(result, Err(MuseError::NotOwner));
}
