const mix = require('laravel-mix');
mix.setPublicPath('public')


mix.copy('views/assets','public/assets')
mix.js('views/resources/dashboard/vue/index.js','public/assets/js/dashboard.js').vue()
mix.js('views/resources/cryptocurrencies/vue/index.js','public/assets/js/cryptocurrencies.js').vue()
mix.js('views/resources/levels/vue/index.js','public/assets/js/levels.js').vue()
mix.js('views/resources/networks/vue/index.js','public/assets/js/networks.js').vue()
mix.js('views/resources/profile/vue/index.js','public/assets/js/profile.js').vue()
mix.js('views/resources/wallet-addresses/vue/index.js','public/assets/js/wallet-addresses.js').vue()
mix.js('views/resources/transaction-histories/vue/index.js','public/assets/js/transaction-histories.js').vue()
mix.js('views/resources/user/vue/index.js','public/assets/js/user.js').vue()
mix.js('views/resources/users/vue/index.js','public/assets/js/users.js').vue()
mix.js('views/resources/login/vue/index.js','public/assets/js/login.js').vue()

