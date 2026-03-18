#![no_std]
use stellar_contract_sdk::{
    contractimpl, contracttype, contracterror, contractfn,
    Address, Env, Symbol, Vec, Map, String, BytesN
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenInfo {
    pub token_id: BytesN<32>,
    pub artwork_id: u64,
    pub owner: Address,
    pub metadata: TokenMetadata,
    pub created_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum TokenError {
    TokenNotFound = 1,
    NotOwner = 2,
    InvalidMetadata = 3,
    Unauthorized = 4,
}

// Storage keys
const TOKENS: Symbol = Symbol::new(&Env::current(), "TOKENS");
const USER_TOKENS: Symbol = Symbol::new(&Env::current(), "USER_TOKENS");

pub struct MuseTokenContract;

#[contractimpl]
impl MuseTokenContract {
    // Create a new NFT token for an artwork
    pub fn mint_token(
        env: &Env,
        artwork_id: u64,
        owner: Address,
        metadata: TokenMetadata,
    ) -> Result<BytesN<32>, TokenError> {
        // Generate unique token ID
        let token_id = env.crypto().sha256(&[
            &artwork_id.to_le_bytes(),
            &owner.clone().to_string().into_bytes(),
            &env.ledger().timestamp().to_le_bytes(),
        ].concat());

        let token_info = TokenInfo {
            token_id: token_id.clone(),
            artwork_id,
            owner: owner.clone(),
            metadata,
            created_at: env.ledger().timestamp(),
        };

        // Store token
        let mut tokens: Map<BytesN<32>, TokenInfo> = env.storage().instance().get(&TOKENS).unwrap_or(Map::new(&env));
        tokens.set(token_id.clone(), token_info);
        env.storage().instance().set(&TOKENS, &tokens);

        // Update user tokens
        let mut user_tokens: Map<Address, Vec<BytesN<32>>> = env.storage().instance().get(&USER_TOKENS).unwrap_or(Map::new(&env));
        let mut token_list = user_tokens.get(owner).unwrap_or(Vec::new(&env));
        token_list.push_back(token_id.clone());
        user_tokens.set(owner, token_list);
        env.storage().instance().set(&USER_TOKENS, &user_tokens);

        Ok(token_id)
    }

    // Transfer token to new owner
    pub fn transfer_token(
        env: &Env,
        from: Address,
        to: Address,
        token_id: BytesN<32>,
    ) -> Result<(), TokenError> {
        let mut tokens: Map<BytesN<32>, TokenInfo> = env.storage().instance().get(&TOKENS).unwrap_or(Map::new(&env));
        let mut token_info = tokens.get(token_id.clone()).ok_or(TokenError::TokenNotFound)?;

        if token_info.owner != from {
            return Err(TokenError::NotOwner);
        }

        // Remove from old owner
        let mut user_tokens: Map<Address, Vec<BytesN<32>>> = env.storage().instance().get(&USER_TOKENS).unwrap_or(Map::new(&env));
        let mut from_tokens = user_tokens.get(from).unwrap_or(Vec::new(&env));
        let mut found_index = None;
        for (i, id) in from_tokens.iter().enumerate() {
            if id == token_id {
                found_index = Some(i);
                break;
            }
        }
        
        if let Some(index) = found_index {
            from_tokens.remove(index as u32);
            user_tokens.set(from, from_tokens);
        }

        // Add to new owner
        let mut to_tokens = user_tokens.get(to.clone()).unwrap_or(Vec::new(&env));
        to_tokens.push_back(token_id.clone());
        user_tokens.set(to, to_tokens);
        env.storage().instance().set(&USER_TOKENS, &user_tokens);

        // Update token ownership
        token_info.owner = to;
        tokens.set(token_id, token_info);
        env.storage().instance().set(&TOKENS, &tokens);

        Ok(())
    }

    // Get token information
    pub fn get_token(env: &Env, token_id: BytesN<32>) -> Result<TokenInfo, TokenError> {
        let tokens: Map<BytesN<32>, TokenInfo> = env.storage().instance().get(&TOKENS).unwrap_or(Map::new(&env));
        tokens.get(token_id).ok_or(TokenError::TokenNotFound)
    }

    // Get user's tokens
    pub fn get_user_tokens(env: &Env, user: Address) -> Vec<BytesN<32>> {
        let user_tokens: Map<Address, Vec<BytesN<32>>> = env.storage().instance().get(&USER_TOKENS).unwrap_or(Map::new(&env));
        user_tokens.get(user).unwrap_or(Vec::new(&env))
    }

    // Check if user owns token
    pub fn is_token_owner(env: &Env, user: Address, token_id: BytesN<32>) -> bool {
        let tokens: Map<BytesN<32>, TokenInfo> = env.storage().instance().get(&TOKENS).unwrap_or(Map::new(&env));
        if let Some(token_info) = tokens.get(token_id) {
            token_info.owner == user
        } else {
            false
        }
    }
}
