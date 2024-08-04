<template>
  <div class="authentication-inner">
    <div class="card">
      <div class="card-body">

        <h4 class="mb-2 text-center">Welcome to Cryptocurrency! 👋</h4>
        <p v-if="errors.length === 0" class="mb-4 text-center">Please sign-in to your account and start the adventure</p>
        <p v-else class="mb-4 text-center text-danger">{{errors[0].msg}}</p>

        <form @submit.prevent="login" class="mb-3" method="POST">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
                type="text"
                class="form-control"
                v-model="email"
                placeholder="Enter your email or username"
                autofocus
            />
          </div>
          <div class="mb-3 form-password-toggle">
            <div class="d-flex justify-content-between">
              <label class="form-label" for="password">Password</label>
            </div>
            <div class="input-group input-group-merge">
              <input
                  type="password"
                  v-model="password"
                  class="form-control"
                  name="password"
                  placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                  aria-describedby="password"
              />
              <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
            </div>
          </div>
          <div class="mb-3">
            <button class="btn btn-primary d-grid w-100" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  watch: {
    email(value) {
      this.errors = []
    },
    password(value) {
      this.errors = []
    },
  },
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      errors: [],
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('/api/login', {
          email: this.email,
          password: this.password,
        });

        if (response.data.message === 'Login successful') {
          window.location = '/dashboard'
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            this.errors = error.response.data.errors;
          } else if (error.response.status === 401) {
            this.errors = [{ msg: 'Incorrect email or password' }];
          } else {
            this.errors = [{ msg: 'An error occurred. Please try again later.' }];
          }
        } else {
          this.errors = [{ msg: 'An error occurred. Please try again later.' }];
        }
      }
    },
  },
};
</script>