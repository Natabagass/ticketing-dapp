#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[derive(Clone)]
pub struct Ticket {
    pub owner: Address,
    pub price: i128,
    pub used: bool,
    pub refunded: bool,
}

use soroban_sdk::contracttype;
#[contracttype]
#[derive(Clone)]
pub struct TicketData {
    pub owner: Address,
    pub price: i128,
    pub used: bool,
    pub refunded: bool,
}
#[contract]
pub struct TicketingContract;

#[contractimpl]
impl TicketingContract {
    fn ticket_key(env: &Env, id: u32) -> (Symbol, u32) {
        (Symbol::new(env, "TICKET"), id)
    }

    fn next_id_key(env: &Env) -> Symbol {
        Symbol::new(env, "NEXT_ID")
    }

    fn sales_key(env: &Env) -> Symbol {
        Symbol::new(env, "TOTAL_SALES")
    }

    fn refund_key(env: &Env) -> Symbol {
        Symbol::new(env, "TOTAL_REFUNDS")
    }

    fn redeem_key(env: &Env) -> Symbol {
        Symbol::new(env, "TOTAL_REDEEM")
    }

    pub fn buy_ticket(env: Env, buyer: Address, price: i128) -> u32 {
        buyer.require_auth();

        let mut next: u32 = env
            .storage()
            .persistent()
            .get(&Self::next_id_key(&env))
            .unwrap_or(0);

        let ticket = TicketData {
            owner: buyer.clone(),
            price,
            refunded: false,
            used: false,
        };

        env.storage()
            .persistent()
            .set(&Self::ticket_key(&env, next), &ticket);

        next += 1;
        env.storage()
            .persistent()
            .set(&Self::next_id_key(&env), &next);

        let total_sales: u32 = env
            .storage()
            .persistent()
            .get(&Self::sales_key(&env))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&Self::sales_key(&env), &(total_sales + 1));

        next - 1
    }

    pub fn request_refund(env: Env, caller: Address, ticket_id: u32) {
        caller.require_auth();

        let key = Self::ticket_key(&env, ticket_id);

        let mut ticket: TicketData = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Ticket not found");

        if ticket.owner != caller {
            panic!("Not ticket owner");
        }

        ticket.refunded = true;

        env.storage().persistent().set(&key, &ticket);

        let refunded: u32 = env
            .storage()
            .persistent()
            .get(&Self::refund_key(&env))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&Self::refund_key(&env), &(refunded + 1));
    }

    pub fn redeem_ticket(env: Env, caller: Address, ticket_id: u32) {
        caller.require_auth();

        let key = Self::ticket_key(&env, ticket_id);

        let mut ticket: TicketData = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Ticket not found");

        if ticket.owner != caller {
            panic!("Not ticket owner");
        }

        if ticket.used {
            panic!("Ticket already used");
        }

        ticket.used = true;

        env.storage().persistent().set(&key, &ticket);

        let redeem: u32 = env
            .storage()
            .persistent()
            .get(&Self::refund_key(&env))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&Self::redeem_key(&env), &(redeem + 1));
    }

    pub fn get_ticket(env: Env, ticket_id: u32) -> TicketData {
        env.storage()
            .persistent()
            .get(&Self::ticket_key(&env, ticket_id))
            .expect("Ticket not found")
    }

    pub fn get_stats(env: Env) -> (u32, u32, u32) {
        let total_sales: u32 = env
            .storage()
            .persistent()
            .get(&Self::sales_key(&env))
            .unwrap_or(0);

        let total_refunds: u32 = env
            .storage()
            .persistent()
            .get(&Self::refund_key(&env))
            .unwrap_or(0);

        let total_redeem: u32 = env
            .storage()
            .persistent()
            .get(&Self::redeem_key(&env))
            .unwrap_or(0);

        (total_sales, total_refunds, total_redeem)
    }
}
