<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can request password reset
     */
    public function test_user_can_request_password_reset(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $response = $this->postJson('/api/password/forgot', [
            'email' => 'test@example.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'
                 ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com'
        ]);
    }

    /**
     * Test password reset with valid token
     */
    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('oldpassword')
        ]);

        $token = Str::random(64);
        
        \DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Votre mot de passe a été réinitialisé avec succès.'
                 ]);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));

        // Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com'
        ]);
    }

    /**
     * Test password reset with invalid token
     */
    public function test_user_cannot_reset_password_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $response = $this->postJson('/api/password/reset', [
            'token' => 'invalid-token',
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test password reset with expired token
     */
    public function test_user_cannot_reset_password_with_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $token = Str::random(64);
        
        \DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subHours(2) // Expired (> 1 hour)
        ]);

        $response = $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test token verification
     */
    public function test_can_verify_token_validity(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $token = Str::random(64);
        
        \DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/password/verify-token', [
            'token' => $token,
            'email' => 'test@example.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['valid' => true]);
    }

    /**
     * Test password confirmation must match
     */
    public function test_password_confirmation_must_match(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);

        $token = Str::random(64);
        
        \DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }
}
