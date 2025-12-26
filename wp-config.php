<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'ui501832_bozzland' );

/** Database username */
define( 'DB_USER', 'ui501832_bozzland' );

/** Database password */
define( 'DB_PASSWORD', '*ht47%f4UR' );

/** Database hostname */
define( 'DB_HOST', 'ui501832.mysql.tools:3306' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'O(Wq(_Iw7iS8SRMIe.?tg$5?UiySu[;~v@~vmmjFsK4o|/jeAs|~Wp4`1~l`=RL=' );
define( 'SECURE_AUTH_KEY',  'tn}iaI8TsmZ<<3jg=^V&/s.1HHI/0A@zQT+$9@82Y{Ra(>7F:5wq-|-%_@hGQ;uT' );
define( 'LOGGED_IN_KEY',    '<>|U[]Z<&A{|H$Xgj)Be(= k&pAxD[Tn.qQFb=<x17EW}86_F>KR}jUQ:z%gG2S_' );
define( 'NONCE_KEY',        ' E+s&i$o<;^_>-f4i+Xt]5=s#`SH}VM/19sMd=x+%*tR[Y1d_QZSWeVo,yJ3hk^I' );
define( 'AUTH_SALT',        '@}]eyXida5$V=0Ft!_aYt3;m!H-W3Wd1BH7;?Fg%YcsiR}pI0zYkB~i3JbU;[vtv' );
define( 'SECURE_AUTH_SALT', 'B{*GQTPG^Qj6/N+_[jQAyD$D1;*@nIm];ju8$kYxcm!V[16D<Mi.OU,:65_+8,LR' );
define( 'LOGGED_IN_SALT',   'Uoh0hcpd(-SX<Pr>quKL,kKq{]1yU+c:?`O3ME7,-7?Jv^`)FFu<qYF#W3^WJm3%' );
define( 'NONCE_SALT',       'A#hgEiya6f^!E^3U)LI&e_[VbpLl{hoE|j5g1a,&T]syX;/fpy;=0bhV{S!b6YhA' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'bz_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
