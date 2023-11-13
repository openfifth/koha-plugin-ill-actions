package Koha::Plugin::Com::PTFSEurope::IllActions;

use Modern::Perl;

use base            qw(Koha::IllActions::Base);
use Koha::DateUtils qw( dt_from_string );

use File::Basename qw( dirname );
use Cwd            qw(abs_path);
use CGI;
use JSON qw( encode_json decode_json );

use JSON           qw( to_json from_json );
use File::Basename qw( dirname );

use Koha::Libraries;
use Koha::Patrons;

our $VERSION = "1.0.0";

our $metadata = {
    name            => 'IllActions',
    author          => 'PTFS-Europe',
    date_authored   => '2023-10-30',
    date_updated    => '2023-10-04',
    minimum_version => '23.11.00.000',
    maximum_version => undef,
    version         => $VERSION,
    description     => 'ILL Actions'
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

=head3 new

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

        my $processinginstructions = {};
        foreach my $key ( keys %{$hashed} ) {
            if ( !exists $blacklist{$key} ) {
                $p->{$key} = $hashed->{$key};
            }
        }

        $self->store_data( { illactions_config => scalar encode_json($p) } );
        print $cgi->redirect( -url =>
                '/cgi-bin/koha/plugins/run.pl?class=Koha::Plugin::Com::PTFSEurope::IllActions&method=configure' );
        exit;
    }
}


sub install() {
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
