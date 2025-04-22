package Koha::Plugin::Com::PTFSEurope::IllActions;

use Modern::Perl;

use base            qw(Koha::Plugins::Base);
use Koha::DateUtils qw( dt_from_string );

use File::Basename qw( dirname );
use Cwd            qw(abs_path);
use CGI;
use JSON qw( encode_json decode_json );

use JSON           qw( to_json from_json );
use File::Basename qw( dirname );

use Koha::Libraries;
use Koha::Patrons;

our $VERSION = "2.1.1";

our $metadata = {
    name            => 'IllActions',
    author          => 'Open Fifth',
    date_authored   => '2023-10-30',
    date_updated    => '2025-04-22',
    minimum_version => '25.05.00.000',
    maximum_version => undef,
    version         => $VERSION,
    description     => 'ILL Actions',
    namespace       => 'ill_actions'
};

=head2 Plugin methods

=head3 new

Required I<Koha::Plugin> method

=cut

sub new {
    my ( $class, $args ) = @_;

    ## We need to add our metadata here so our base class can access it
    $args->{'metadata'} = $metadata;
    $args->{'metadata'}->{'class'} = $class;

    ## Here, we call the 'new' method for our base class
    ## This runs some additional magic and checking
    ## and returns our actual $self
    my $self = $class->SUPER::new($args);

    $self->{config} = decode_json( $self->retrieve_data('illactions_config') || '{}' );

    return $self;
}

=head3 configure

Optional I<Koha::Plugin> method if it implements configuration

=cut

sub configure {
    my ( $self, $args ) = @_;
    my $cgi = $self->{'cgi'};

    unless ( $cgi->param('save') ) {
        my $template = $self->get_template( { file => 'configure.tt' } );
        my $config   = $self->{config};

        $template->param(
            config => $self->{config},
            cwd    => dirname(__FILE__)
        );
        $self->output_html( $template->output() );
    } else {
        my %blacklist = ( 'save' => 1, 'class' => 1, 'method' => 1 );
        my $hashed    = { map { $_ => ( scalar $cgi->param($_) )[0] } $cgi->param };
        my $p         = {};

        foreach my $key ( keys %{$hashed} ) {
            if ( !exists $blacklist{$key} ) {
                $p->{$key} = $hashed->{$key};
            }
        }

        $self->store_data( { illactions_config => scalar encode_json($p) } );
        print $cgi->redirect(
            -url => '/cgi-bin/koha/plugins/run.pl?class=Koha::Plugin::Com::PTFSEurope::IllActions&method=configure' );
        exit;
    }
}

=head3 ill_table_actions

Define ILL table actions

=cut

sub ill_table_actions {
    my ( $self, $table_actions ) = @_;

    push(
        @{$$table_actions},
        {
            button_class               => 'btn btn-default btn-sm',
            button_link                => '/api/v1/contrib/ill_actions/new_request_for_patron/',
            append_column_data_to_link => 1,
            button_link_text           => 'New request for this user'
        }
    ) if $self->{config}->{new_request_for_user_table_button};
}

sub intranet_js {
    my ($self) = @_;

    my $script = '<script>';
    $script .= $self->mbf_read('js/init.js');
    $script .= $self->mbf_read('js/new_request_for_user_table_button.js')
        if $self->{config}->{new_request_for_user_table_button};
    $script .= $self->mbf_read('js/new_request_for_user_manage_button.js')
        if $self->{config}->{new_request_for_user_manage_button};
    $script .= $self->mbf_read('js/default_library_to_user_library.js')
        if $self->{config}->{default_library_to_user_library};
    $script .= $self->mbf_read('js/quick_add_user.js')
        if $self->{config}->{quick_add_user};
    $script .= $self->mbf_read('js/auto_fill_form_metadata.js')
        if $self->{config}->{auto_fill_form_metadata_staff};
    $script .= '</script>';

    return $script;
}

sub opac_js {
    my ($self) = @_;

    my $script = '<script>';
    $script .= $self->mbf_read('js/auto_fill_form_metadata.js')
        if $self->{config}->{auto_fill_form_metadata_opac};
    $script .= '</script>';

    return $script;
}

# =head3 ill_available_actions

# Pluggable by having
#     Koha::Plugins->call( 'ill_available_actions', \@available_actions );
# at the end of Illrequest::available_actions

# Would be great to be able to plug in ILL available actions
# but this requires a big overhaul in ill-requests.pl and ill-requests.tt
# and I'm not sure it's worth it

# For now, this functionality is included in intranet_js

# =cut

# sub ill_available_actions {
#     my ( $self, $available_actions ) = @_;

#     my $new_request_for_user = {
#         name   => 'Edited item metadata',
#         method => 'create',
#         id             => undef,
#         ui_method_icon => 'fa-plus',
#         prev_actions   => [],
#         ui_method_name => 'New request for this user',
#         next_actions   => [],
#     };

#     push( @$available_actions, $new_request_for_user );
# }

sub api_routes {
    my ( $self, $args ) = @_;

    my $spec_str = $self->mbf_read('openapi.json');
    my $spec     = decode_json($spec_str);

    return $spec;
}

sub api_namespace {
    my ($self) = @_;

    return 'ill_actions';
}

sub install() {
    my ($self) = @_;

    my $default_config = {
        auto_fill_form_metadata_staff      => "on",
        auto_fill_form_metadata_opac       => "on",
        default_library_to_user_library    => "on",
        new_request_for_user_manage_button => "on",
        new_request_for_user_table_button  => "on",
        quick_add_user                     => "on",
    };

    $self->store_data( { illactions_config => scalar encode_json($default_config) } )
        unless $self->retrieve_data('illactions_config');

    return 1;
}

sub upgrade {
    my ( $self, $args ) = @_;

    my $dt = dt_from_string();
    $self->store_data( { last_upgraded => $dt->ymd('-') . ' ' . $dt->hms(':') } );

    return 1;
}

sub uninstall() {
    return 1;
}

1;
